"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { connection } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { favorites } from "@/db/schema";

export type ToggleResult = { ok: true; favorited: boolean } | { ok: false; reason: "login" | "error" };

/** Dodaje/uklanja oglas iz sačuvanih za prijavljenog korisnika. Bez sesije vraća reason "login" (klijent vodi na prijavu). */
export async function toggleFavorite(listingId: string): Promise<ToggleResult> {
  await connection();
  const session = await auth();
  if (!session) return { ok: false, reason: "login" };
  const parsed = z.uuid().safeParse(listingId);
  if (!parsed.success) return { ok: false, reason: "error" };
  const userId = session.user.id;
  const existing = await db.query.favorites.findFirst({
    where: and(eq(favorites.userId, userId), eq(favorites.listingId, parsed.data)),
  });
  if (existing) {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.listingId, parsed.data)));
    return { ok: true, favorited: false };
  }
  await db.insert(favorites).values({ userId, listingId: parsed.data }).onConflictDoNothing();
  return { ok: true, favorited: true };
}
