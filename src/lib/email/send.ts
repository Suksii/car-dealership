import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SITE } from "@/config/site";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Odgovor ide na ovu adresu (npr. email placa), umjesto na pošiljaoca. */
  replyTo?: string;
}

export const EMAIL_FROM = process.env.EMAIL_FROM ?? `${SITE.name} <noreply@${SITE.domain}>`;
/** Kome idu obavještenja (novi plac, prijava oglasa). */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? SITE.email;

/**
 * Šalje email preko Resend API-ja (bez SDK-a, jedan fetch). Bez RESEND_API_KEY:
 * lokalno se poruka upisuje u storage/dev-mail/*.html da se može otvoriti u browseru,
 * a u produkciji se vraća greška. Nikad ne baca: pozivalac odlučuje šta radi sa neuspjehom.
 */
export async function sendEmail(msg: EmailMessage): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      console.error("[email] RESEND_API_KEY nije podešen; poruka nije poslata:", msg.subject);
      return { ok: false, error: "email-not-configured" };
    }
    return writeDevMail(msg);
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Resend ${res.status}:`, body.slice(0, 300));
      return { ok: false, error: `resend-${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] slanje nije uspjelo:", err);
    return { ok: false, error: "network" };
  }
}

async function writeDevMail(msg: EmailMessage) {
  const dir = path.join(process.cwd(), "storage", "dev-mail");
  await mkdir(dir, { recursive: true });
  const name = `${new Date().toISOString().replace(/[:.]/g, "-")}-${msg.subject
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40)}.html`;
  const header = `<!-- To: ${msg.to} | Subject: ${msg.subject} -->\n`;
  await writeFile(path.join(dir, name), header + msg.html, "utf8");
  return { ok: true };
}
