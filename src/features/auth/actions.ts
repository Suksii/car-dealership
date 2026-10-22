"use server";

import { z } from "zod";
import { safeNextPath } from "@/features/auth/lib/safeNext";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { SITE } from "@/config/site";
import { sendEmail } from "@/lib/email/send";
import { passwordResetEmail } from "@/lib/email/templates";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { RESET_TOKEN_MINUTES, hashResetToken, isWellFormedToken, newResetToken } from "@/features/auth/lib/resetToken";
import { signIn } from "@/auth";

export type FormState = { errors?: Record<string, string>; message?: string } | undefined;

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const safeNext = safeNextPath;

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Unesi ime i prezime"),
    email: z.email("Unesi ispravan email").trim().toLowerCase(),
    phone: z.string().trim().min(6, "Unesi broj telefona"),
    password: z.string().min(8, "Lozinka mora imati bar 8 karaktera"),
    passwordConfirm: z.string(),
    terms: z.literal("on", { message: "Moraš prihvatiti uslove korišćenja" }),
  })
  .refine((d) => d.password === d.passwordConfirm, { path: ["passwordConfirm"], message: "Lozinke se ne poklapaju" });

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const { name, email, phone, password } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return { errors: { email: "Nalog sa ovim emailom već postoji" } };

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ name, email, phone, passwordHash, termsAcceptedAt: new Date() });

  await signIn("credentials", { email, password, redirectTo: "/nalog" });
}

const loginSchema = z.object({
  email: z.email("Unesi ispravan email").trim().toLowerCase(),
  password: z.string().min(1, "Unesi lozinku"),
  next: z.string().optional(),
});

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const { email, password, next } = parsed.data;

  try {
    await signIn("credentials", { email, password, redirectTo: safeNext(next) });
  } catch (err) {
    if (err instanceof AuthError) return { message: "Pogrešan email ili lozinka" };
    throw err; // redirect() baca grešku koju Next mora da propusti
  }
  redirect(safeNext(next));
}

export async function loginWithGoogle(formData: FormData) {
  await signIn("google", { redirectTo: safeNext(formData.get("next")) });
}

// ---------------- zaboravljena lozinka ----------------
const forgotSchema = z.object({ email: z.email("Unesi ispravan email").trim().toLowerCase() });
/** Isti odgovor bez obzira da li nalog postoji (da se ne može provjeravati ko je registrovan). */
const FORGOT_DONE = "Ako nalog sa tim emailom postoji, poslali smo link za novu lozinku. Provjeri i spam folder.";

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const { email } = parsed.data;

  // Ograničenje i po emailu, ne samo po IP-u (proxy): najviše 3 linka na sat za isti nalog.
  const ip = clientIp(await headers());
  if (!rateLimit(`forgot:${email}`, 3, 3600_000).ok || !rateLimit(`forgot-ip:${ip}`, 10, 3600_000).ok)
    return { message: FORGOT_DONE };

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || user.isBlocked) return { message: FORGOT_DONE };

  const token = newResetToken();
  await db.transaction(async (tx) => {
    // Važi samo posljednji link.
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
    await tx.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashResetToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_MINUTES * 60_000),
    });
  });
  const link = `${SITE.url}/nova-lozinka?token=${token}`;
  const sent = await sendEmail({ to: user.email, ...passwordResetEmail(user.name, link, RESET_TOKEN_MINUTES) });
  if (!sent.ok) return { message: "Slanje emaila trenutno ne radi. Pokušaj ponovo za par minuta." };
  return { message: FORGOT_DONE };
}

const resetSchema = z
  .object({
    token: z.string(),
    password: z.string().min(8, "Lozinka mora imati bar 8 karaktera"),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, { path: ["passwordConfirm"], message: "Lozinke se ne poklapaju" });

const RESET_INVALID = "Link je istekao ili je već iskorišćen. Zatraži novi.";

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const { token, password } = parsed.data;
  if (!isWellFormedToken(token)) return { message: RESET_INVALID };

  const now = new Date();
  const row = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.tokenHash, hashResetToken(token)),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, now),
    ),
  });
  if (!row) return { message: RESET_INVALID };

  const passwordHash = await bcrypt.hash(password, 10);
  const updated = await db.transaction(async (tx) => {
    // Označi token kao iskorišćen samo ako to već nije uradio paralelni zahtjev.
    const used = await tx
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(and(eq(passwordResetTokens.id, row.id), isNull(passwordResetTokens.usedAt)))
      .returning({ id: passwordResetTokens.id });
    if (used.length === 0) return false;
    await tx.update(users).set({ passwordHash, updatedAt: now }).where(eq(users.id, row.userId));
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, row.userId));
    return true;
  });
  if (!updated) return { message: RESET_INVALID };
  redirect("/prijava?lozinka=nova");
}
