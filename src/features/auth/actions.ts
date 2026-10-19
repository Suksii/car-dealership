"use server";

import { z } from "zod";
import { safeNextPath } from "@/features/auth/lib/safeNext";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
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
