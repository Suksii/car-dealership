import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { listings, dealers } from "@/db/schema";

/** Slugovi za generateStaticParams: zadnjih 50 aktivnih oglasa. Ostali se renderuju na zahtjev. */
export async function getRecentListingSlugs(limit = 50): Promise<string[]> {
  const rows = await db
    .select({ slug: listings.slug, publicId: listings.publicId })
    .from(listings)
    .innerJoin(dealers, eq(dealers.id, listings.dealerId))
    .where(eq(listings.status, "active"))
    .orderBy(desc(listings.publishedAt))
    .limit(limit);
  return rows.map((r) => `${r.slug}-${r.publicId}`);
}

export async function getDealerSlugs(): Promise<string[]> {
  const rows = await db.select({ slug: dealers.slug }).from(dealers).where(eq(dealers.status, "active"));
  return rows.map((r) => r.slug);
}
