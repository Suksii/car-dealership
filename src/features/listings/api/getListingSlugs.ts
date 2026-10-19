import { cacheLife, cacheTag } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { listings, dealers } from "@/db/schema";
import { LISTINGS_TAG } from "@/features/listings/api/getListings";
import { DEALERS_TAG } from "@/features/dealers/api/getDealers";

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

/** Svi aktivni oglasi i placevi za sitemap. Keširano uz tagove, pa se osvježava kad plac nešto promijeni. */
export async function getSitemapEntries() {
  "use cache";
  cacheLife("hours");
  cacheTag(LISTINGS_TAG, DEALERS_TAG);
  const l = await db
    .select({ slug: listings.slug, publicId: listings.publicId, updatedAt: listings.updatedAt })
    .from(listings)
    .innerJoin(dealers, eq(dealers.id, listings.dealerId))
    .where(and(eq(listings.status, "active"), eq(dealers.status, "active")))
    .orderBy(desc(listings.publishedAt));
  const d = await db
    .select({ slug: dealers.slug, updatedAt: dealers.updatedAt })
    .from(dealers)
    .where(eq(dealers.status, "active"));
  return {
    listings: l.map((r) => ({ slug: `${r.slug}-${r.publicId}`, updatedAt: r.updatedAt })),
    dealers: d,
  };
}
