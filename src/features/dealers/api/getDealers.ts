import { cacheLife, cacheTag } from "next/cache";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { dealers } from "@/db/schema";
import { imageUrl } from "@/lib/images";

export const DEALERS_TAG = "dealers";

export interface DealerCardItem {
  id: string;
  slug: string;
  name: string;
  city: string;
  citySlug: string;
  logo: string | null;
  activeListings: number;
  isFeatured: boolean;
  verified: boolean;
  /** Do 3 slike najnovijih oglasa (za karticu placa). */
  previews: string[];
}

export async function getDealers(): Promise<DealerCardItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(DEALERS_TAG);
  const rows = await db.query.dealers.findMany({
    where: eq(dealers.status, "active"),
    orderBy: [desc(dealers.isFeatured), desc(dealers.activeListingsCount), asc(dealers.name)],
    with: { city: true },
  });
  const previews = rows.length
    ? await db.execute<{ dealer_id: string; key: string }>(sql`
    SELECT dealer_id, storage_key AS key FROM (
      SELECT l.dealer_id, li.storage_key, row_number() OVER (PARTITION BY l.dealer_id ORDER BY l.published_at DESC, l.id) AS rn
      FROM listings l JOIN listing_images li ON li.listing_id = l.id AND li.sort_order = 0
      WHERE l.status = 'active' AND l.dealer_id IN ${sql`(${sql.join(
        rows.map((r) => sql`${r.id}`),
        sql`, `,
      )})`}
    ) t WHERE rn <= 3 ORDER BY dealer_id, rn`)
    : [];
  const byDealer = new Map<string, string[]>();
  for (const p of previews) byDealer.set(p.dealer_id, [...(byDealer.get(p.dealer_id) ?? []), imageUrl(p.key, "thumb")]);
  return rows.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    city: d.city.name,
    citySlug: d.city.slug,
    logo: d.logoKey ? imageUrl(d.logoKey, "card") : null,
    activeListings: d.activeListingsCount,
    isFeatured: d.isFeatured,
    verified: !!d.verifiedAt,
    previews: byDealer.get(d.id) ?? [],
  }));
}

export async function getDealerBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(DEALERS_TAG, `dealer:${slug}`);
  const d = await db.query.dealers.findFirst({ where: eq(dealers.slug, slug), with: { city: true } });
  if (!d || d.status !== "active") return null;
  return {
    ...d,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    logo: d.logoKey ? imageUrl(d.logoKey, "card") : null,
    cover: d.coverKey ? imageUrl(d.coverKey, "full") : null,
  };
}
export type DealerDetail = NonNullable<Awaited<ReturnType<typeof getDealerBySlug>>>;
