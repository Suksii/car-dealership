import { and, count, eq, gte, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { contactClicks, listingViewsDaily } from "@/db/schema";
import { CONTACT_TYPE, type ContactTypeKey } from "@/features/listings/lib/labels";
import { STATS_DAYS, STATS_TZ, fillSeries, lastDays } from "@/features/dealer-panel/lib/stats";

/** Statistika jednog placa za zadnjih 30 lokalnih dana. Per-user podaci: bez keša, poziva se poslije requireDealer(). */
export async function getDealerStats(dealerId: string) {
  const days = lastDays(STATS_DAYS);
  const from = days[0];
  const from7 = days[days.length - 7];
  const clicksSince = (day: string) => sql`${contactClicks.createdAt} >= (${day}::date AT TIME ZONE ${STATS_TZ})`;

  const [daily, byType, viewsByListing, clicksByListing] = await Promise.all([
    db
      .select({ day: listingViewsDaily.day, views: sum(listingViewsDaily.views).mapWith(Number) })
      .from(listingViewsDaily)
      .where(and(eq(listingViewsDaily.dealerId, dealerId), gte(listingViewsDaily.day, from)))
      .groupBy(listingViewsDaily.day),
    db
      .select({
        type: contactClicks.type,
        total: count(),
        last7: sql<number>`count(*) FILTER (WHERE ${clicksSince(from7)})`.mapWith(Number),
      })
      .from(contactClicks)
      .where(and(eq(contactClicks.dealerId, dealerId), clicksSince(from)))
      .groupBy(contactClicks.type),
    db
      .select({ listingId: listingViewsDaily.listingId, n: sum(listingViewsDaily.views).mapWith(Number) })
      .from(listingViewsDaily)
      .where(and(eq(listingViewsDaily.dealerId, dealerId), gte(listingViewsDaily.day, from)))
      .groupBy(listingViewsDaily.listingId),
    db
      .select({ listingId: contactClicks.listingId, n: count() })
      .from(contactClicks)
      .where(and(eq(contactClicks.dealerId, dealerId), clicksSince(from)))
      .groupBy(contactClicks.listingId),
  ]);

  const series = fillSeries(days, daily);
  const contacts = (Object.keys(CONTACT_TYPE) as ContactTypeKey[]).map((type) => {
    const row = byType.find((r) => r.type === type);
    return { type, total: row?.total ?? 0, last7: row?.last7 ?? 0 };
  });

  return {
    series,
    views: series.reduce((a, d) => a + d.views, 0),
    views7: series.slice(-7).reduce((a, d) => a + d.views, 0),
    contacts,
    contactsTotal: contacts.reduce((a, c) => a + c.total, 0),
    contacts7: contacts.reduce((a, c) => a + c.last7, 0),
    byListing: {
      views: new Map(viewsByListing.map((r) => [r.listingId, r.n])),
      contacts: new Map(clicksByListing.map((r) => [r.listingId, r.n])),
    },
  };
}

export type DealerStats = Awaited<ReturnType<typeof getDealerStats>>;
