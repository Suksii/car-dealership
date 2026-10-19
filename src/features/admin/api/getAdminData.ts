import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { contactClicks, dealers, listings, reports, users } from "@/db/schema";
import { imageUrl } from "@/lib/images";

/** Admin podaci se ne keširaju: uvijek svježe, čita se samo poslije requireAdmin(). */

export async function getAdminStats() {
  const [pending] = await db.select({ n: count() }).from(dealers).where(eq(dealers.status, "pending"));
  const [active] = await db.select({ n: count() }).from(listings).where(eq(listings.status, "active"));
  const since = new Date(Date.now() - 7 * 86400_000);
  const [clicks] = await db.select({ n: count() }).from(contactClicks).where(gte(contactClicks.createdAt, since));
  const [open] = await db.select({ n: count() }).from(reports).where(eq(reports.status, "open"));
  return { pendingDealers: pending.n, activeListings: active.n, contactClicks7d: clicks.n, openReports: open.n };
}

export async function getDealersForAdmin() {
  const rows = await db
    .select({
      id: dealers.id,
      slug: dealers.slug,
      name: dealers.name,
      status: dealers.status,
      isFeatured: dealers.isFeatured,
      phone: dealers.phone,
      activeListings: dealers.activeListingsCount,
      createdAt: dealers.createdAt,
      logoKey: dealers.logoKey,
      city: sql<string>`(SELECT name FROM cities WHERE cities.id = ${dealers.cityId})`,
      ownerEmail: users.email,
      ownerName: users.name,
    })
    .from(dealers)
    .innerJoin(users, eq(users.id, dealers.ownerUserId))
    .orderBy(
      sql`CASE ${dealers.status} WHEN 'pending' THEN 0 WHEN 'active' THEN 1 ELSE 2 END`,
      desc(dealers.createdAt),
    );
  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    logo: r.logoKey ? imageUrl(r.logoKey, "thumb") : null,
  }));
}

export async function getListingsForAdmin(limit = 60) {
  const rows = await db.query.listings.findMany({
    where: and(sql`${listings.status} <> 'removed'`),
    orderBy: desc(listings.createdAt),
    limit,
    with: {
      make: true,
      model: true,
      dealer: { columns: { name: true, slug: true, status: true } },
      images: { limit: 1, orderBy: (i, { asc }) => asc(i.sortOrder) },
    },
  });
  return rows.map((l) => ({
    id: l.id,
    slug: l.slug,
    publicId: l.publicId,
    status: l.status,
    year: l.year,
    priceEur: l.priceEur,
    priceOnRequest: l.priceOnRequest,
    title: `${l.make.name} ${l.model.name}${l.variant ? ` ${l.variant}` : ""}`,
    viewsCount: l.viewsCount,
    createdAt: l.createdAt.toISOString(),
    dealer: l.dealer,
    thumb: l.images[0] ? imageUrl(l.images[0].storageKey, "thumb") : null,
  }));
}

/** Prijave: otvorene prve, pa zadnjih 30 riješenih. */
export async function getReportsForAdmin() {
  const rows = await db.query.reports.findMany({
    orderBy: [sql`CASE ${reports.status} WHEN 'open' THEN 0 ELSE 1 END`, desc(reports.createdAt)],
    limit: 80,
    with: {
      listing: {
        columns: { id: true, slug: true, publicId: true, status: true, variant: true },
        with: { make: true, model: true, dealer: { columns: { name: true } } },
      },
      reporter: { columns: { email: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    reason: r.reason,
    message: r.message,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    reporterEmail: r.reporter?.email ?? null,
    listing: {
      id: r.listing.id,
      slug: r.listing.slug,
      publicId: r.listing.publicId,
      status: r.listing.status,
      title: `${r.listing.make.name} ${r.listing.model.name}${r.listing.variant ? ` ${r.listing.variant}` : ""}`,
      dealerName: r.listing.dealer?.name ?? "—",
    },
  }));
}
