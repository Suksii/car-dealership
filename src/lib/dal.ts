import { cache } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { eq, or } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { dealers, dealerMembers } from "@/db/schema";

/** Sesija ili redirect na prijavu. connection() je obavezan prije auth() zbog cacheComponents. */
export const requireSession = cache(async (next = "/nalog") => {
  await connection();
  const session = await auth();
  if (!session) redirect(`/prijava?next=${encodeURIComponent(next)}`);
  return session;
});

/** Plac prijavljenog korisnika (vlasnik ili član), ili null. */
export const getMyDealer = cache(async () => {
  const session = await requireSession("/plac");
  const [row] = await db
    .select({ dealer: dealers })
    .from(dealers)
    .leftJoin(dealerMembers, eq(dealerMembers.dealerId, dealers.id))
    .where(or(eq(dealers.ownerUserId, session.user.id), eq(dealerMembers.userId, session.user.id)))
    .limit(1);
  return row?.dealer ?? null;
});

/** Plac ili redirect na registraciju placa. */
export async function requireDealer() {
  const dealer = await getMyDealer();
  if (!dealer) redirect("/plac/registracija");
  return dealer;
}

/** Admin sesija ili redirect na naslovnu (proxy već štiti /admin, ovo je druga linija). */
export const requireAdmin = cache(async () => {
  const session = await requireSession("/admin");
  if (session.user.role !== "admin") redirect("/");
  return session;
});
