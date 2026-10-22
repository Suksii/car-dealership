import { createHash, randomBytes } from "node:crypto";

/** Koliko dugo važi link za novu lozinku. */
export const RESET_TOKEN_MINUTES = 60;

/** Nasumičan token za link (256 bita, URL-bezbjedan). U bazu ide samo hash. */
export function newResetToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Token iz URL-a: tačno 43 base64url znaka; sve ostalo se odbija bez upita u bazu. */
export function isWellFormedToken(token: unknown): token is string {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
}
