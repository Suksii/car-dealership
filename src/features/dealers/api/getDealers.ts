import { cacheLife, cacheTag } from "next/cache";
import { asc, desc, eq } from "drizzle-orm";
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
}

export async function getDealers(): Promise<DealerCardItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(DEALERS_TAG);
  const rows = await db.query.dealers.findMany({
    where: eq(dealers.status, "active"),
    orderBy: [desc(dealers.isFeatured), desc(dealers.activeListingsCount), asc(dealers.name)],
    with: { city: true },
  });
  return rows.map((d) => ({
    id: d.id, slug: d.slug, name: d.name, city: d.city.name, citySlug: d.city.slug,
    logo: d.logoKey ? imageUrl(d.logoKey, "card") : null,
    activeListings: d.activeListingsCount, isFeatured: d.isFeatured,
  }));
}

export async function getDealerBySlug(slug: string) {
  "use cache";
  cacheLife("minutes");
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
