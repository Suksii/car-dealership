import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { favorites } from "@/db/schema";

/** ID-jevi sačuvanih oglasa prijavljenog korisnika (klijent ih učita jednom, FavoritesProvider). */
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ ids: [] }, { headers: { "Cache-Control": "no-store" } });
  const rows = await db
    .select({ id: favorites.listingId })
    .from(favorites)
    .where(eq(favorites.userId, session.user.id));
  return NextResponse.json({ ids: rows.map((r) => r.id) }, { headers: { "Cache-Control": "no-store" } });
}
