import { cacheLife, cacheTag } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export const PRICE_STATS_TAG = "price-stats";
const MIN_SAMPLE = 3;

export interface PriceStat {
  median: number;
  p25: number;
  p75: number;
  sampleSize: number;
  approx: boolean;
}

/**
 * Procjena iz materijalizovanog view-a price_stats (osvježava ga scripts/refresh-stats.mts).
 * Prvo tačno godište; ako nema dovoljno uzoraka, ±1 godište (approx = true). Null ako ni tada nema MIN_SAMPLE.
 */
export async function getPriceStat(makeId: number, modelId: number, year: number): Promise<PriceStat | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(PRICE_STATS_TAG);
  type Row = { median: string; p25: string; p75: string; n: number };
  const exact = await db.execute<Row>(sql`
    SELECT median_price AS median, p25_price AS p25, p75_price AS p75, sample_size AS n
    FROM price_stats WHERE make_id = ${makeId} AND model_id = ${modelId} AND year = ${year}`);
  const e = exact[0];
  if (e && e.n >= MIN_SAMPLE)
    return { median: Number(e.median), p25: Number(e.p25), p75: Number(e.p75), sampleSize: e.n, approx: false };

  const near = await db.execute<Row>(sql`
    SELECT sum(median_price * sample_size) / sum(sample_size) AS median,
           min(p25_price) AS p25, max(p75_price) AS p75, sum(sample_size)::int AS n
    FROM price_stats WHERE make_id = ${makeId} AND model_id = ${modelId} AND year BETWEEN ${year - 1} AND ${year + 1}`);
  const r = near[0];
  if (!r || !r.n || r.n < MIN_SAMPLE) return null;
  return { median: Number(r.median), p25: Number(r.p25), p75: Number(r.p75), sampleSize: r.n, approx: true };
}
