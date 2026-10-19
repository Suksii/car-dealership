import { cacheLife, cacheTag } from "next/cache";
import { and, asc, count, desc, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { listings, dealers, makes, models, cities } from "@/db/schema";
import { toCardItem, type ListingCardItem } from "@/features/listings/lib/card";
import type { FuelKey, TransmissionKey, BodyKey } from "@/features/listings/lib/labels";
import { imageUrl } from "@/lib/images";

export const LISTINGS_TAG = "listings";
export const PAGE_SIZE = 24;

export interface ListingFilters {
  make?: string; // slug
  model?: string; // slug
  city?: string; // slug
  dealer?: string; // slug
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  kmMax?: number;
  fuel?: FuelKey;
  transmission?: TransmissionKey;
  body?: BodyKey;
  sort?: "newest" | "price_asc" | "price_desc" | "year_desc" | "km_asc";
  page?: number;
}

/** Javno vidljiv: aktivan, plac aktivan i nije istekao (cron ga tek kasnije označi kao expired). */
const publicListing = () =>
  and(eq(listings.status, "active"), eq(dealers.status, "active"), sql`${listings.expiresAt} > now()`);

function whereFor(f: ListingFilters): SQL[] {
  const w: SQL[] = [];
  if (f.make) w.push(eq(makes.slug, f.make));
  if (f.model) w.push(eq(models.slug, f.model));
  if (f.city) w.push(eq(cities.slug, f.city));
  if (f.dealer) w.push(eq(dealers.slug, f.dealer));
  if (f.priceMin) w.push(gte(listings.priceEur, f.priceMin));
  if (f.priceMax) w.push(and(lte(listings.priceEur, f.priceMax), eq(listings.priceOnRequest, false))!);
  if (f.yearMin) w.push(gte(listings.year, f.yearMin));
  if (f.yearMax) w.push(lte(listings.year, f.yearMax));
  if (f.kmMax) w.push(lte(listings.mileageKm, f.kmMax));
  if (f.fuel) w.push(eq(listings.fuel, f.fuel));
  if (f.transmission) w.push(eq(listings.transmission, f.transmission));
  if (f.body) w.push(eq(listings.bodyType, f.body));
  return w;
}

const ORDER = {
  newest: [desc(listings.publishedAt)],
  price_asc: [asc(listings.priceOnRequest), asc(listings.priceEur)],
  price_desc: [desc(listings.priceEur)],
  year_desc: [desc(listings.year), desc(listings.publishedAt)],
  km_asc: [asc(listings.mileageKm)],
};

/** Javna lista oglasa sa filterima i paginacijom. Keširano, invalidira se tagom. */
export async function getListings(
  f: ListingFilters,
): Promise<{ items: ListingCardItem[]; total: number; page: number; lastPage: number }> {
  "use cache";
  cacheLife("hours"); // svaka izmjena zove updateTag(LISTINGS_TAG), pa kratak TTL nije potreban
  cacheTag(LISTINGS_TAG);

  const page = Math.max(1, f.page ?? 1);
  const where = and(publicListing(), ...whereFor(f));

  // Jedan upit za stranu ID-jeva i ukupan broj (count(*) over()), umjesto dva.
  const idRows = await db
    .select({ id: listings.id, total: sql<number>`count(*) over()::int` })
    .from(listings)
    .innerJoin(dealers, eq(dealers.id, listings.dealerId))
    .innerJoin(makes, eq(makes.id, listings.makeId))
    .innerJoin(models, eq(models.id, listings.modelId))
    .innerJoin(cities, eq(cities.id, listings.cityId))
    .where(where)
    .orderBy(...ORDER[f.sort ?? "newest"], desc(listings.id))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const total = idRows[0]?.total ?? 0;

  const ids = idRows.map((r) => r.id);
  const rows = ids.length
    ? await db.query.listings.findMany({
        where: sql`${listings.id} IN ${ids}`,
        with: {
          make: true,
          model: true,
          city: true,
          dealer: { columns: { name: true, slug: true } },
          images: { limit: 1, orderBy: (i, { asc }) => asc(i.sortOrder) },
        },
      })
    : [];
  const byId = new Map(rows.map((r) => [r.id, r]));
  const now = Date.now();
  const items = ids
    .map((id) => byId.get(id)!)
    .filter(Boolean)
    .map((r) => toCardItem(r, now));
  return { items, total, page, lastPage: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Samo broj oglasa za filtere (dugme „Prikaži N oglasa" u sheet-u na telefonu). Isti keš i tag kao lista. */
export async function countListings(f: ListingFilters): Promise<number> {
  "use cache";
  cacheLife("hours");
  cacheTag(LISTINGS_TAG);
  const [row] = await db
    .select({ n: count() })
    .from(listings)
    .innerJoin(dealers, eq(dealers.id, listings.dealerId))
    .innerJoin(makes, eq(makes.id, listings.makeId))
    .innerJoin(models, eq(models.id, listings.modelId))
    .innerJoin(cities, eq(cities.id, listings.cityId))
    .where(and(publicListing(), ...whereFor(f)));
  return row?.n ?? 0;
}

export async function getLatestListings(limit = 8): Promise<ListingCardItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(LISTINGS_TAG);
  const { items } = await getListings({ sort: "newest" });
  return items.slice(0, limit);
}

export async function getSiteStats(): Promise<{ listings: number; dealers: number; cities: number }> {
  "use cache";
  cacheLife("hours");
  cacheTag(LISTINGS_TAG);
  const [l] = await db
    .select({ n: count() })
    .from(listings)
    .innerJoin(dealers, eq(dealers.id, listings.dealerId))
    .where(publicListing());
  const [d] = await db.select({ n: count() }).from(dealers).where(eq(dealers.status, "active"));
  const [c] = await db
    .select({ n: sql<number>`count(distinct ${dealers.cityId})::int` })
    .from(dealers)
    .where(eq(dealers.status, "active"));
  return { listings: l.n, dealers: d.n, cities: c.n };
}

export interface BodyTypeStat {
  body: BodyKey;
  count: number;
  image: string | null;
}

/** Broj aktivnih oglasa po karoseriji + slika najnovijeg oglasa te karoserije (za naslovnu). */
export async function getBodyTypeStats(): Promise<BodyTypeStat[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(LISTINGS_TAG);
  const rows = await db.execute<{ body: BodyKey; count: number; key: string | null }>(sql`
    SELECT l.body_type AS body, count(*)::int AS count,
      (SELECT li.storage_key FROM listings l2 JOIN listing_images li ON li.listing_id = l2.id
         JOIN dealers d2 ON d2.id = l2.dealer_id AND d2.status = 'active'
         WHERE l2.body_type = l.body_type AND l2.status = 'active' AND l2.expires_at > now()
         ORDER BY l2.published_at DESC, li.sort_order LIMIT 1) AS key
    FROM listings l JOIN dealers d ON d.id = l.dealer_id
    WHERE l.status = 'active' AND d.status = 'active' AND l.expires_at > now()
    GROUP BY l.body_type ORDER BY count DESC`);
  return rows.map((r) => ({ body: r.body, count: r.count, image: r.key ? imageUrl(r.key, "card") : null }));
}
