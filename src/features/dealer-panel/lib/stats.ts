import { sql } from "drizzle-orm";

/** Statistika se broji po lokalnom danu u Crnoj Gori, bez obzira na zonu servera. */
export const STATS_TZ = "Europe/Podgorica";
export const STATS_DAYS = 30;

/** Današnji lokalni dan kao SQL `date` (za upis u listing_views_daily). */
export const LOCAL_DAY_SQL = sql.raw(`(now() AT TIME ZONE '${STATS_TZ}')::date`);

/** Lokalni dan kao "YYYY-MM-DD". */
export function localDay(at: Date | number, timeZone = STATS_TZ): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

/** Zadnjih `n` lokalnih dana, od najstarijeg do današnjeg. */
export function lastDays(n: number, now: Date | number = Date.now(), timeZone = STATS_TZ): string[] {
  const today = new Date(`${localDay(now, timeZone)}T00:00:00Z`);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

/** Niz dana -> broj pregleda; dani bez reda u bazi su 0. */
export function fillSeries(days: string[], rows: { day: string; views: number }[]) {
  const byDay = new Map(rows.map((r) => [r.day, r.views]));
  return days.map((day) => ({ day, views: byDay.get(day) ?? 0 }));
}
