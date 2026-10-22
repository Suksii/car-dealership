import { cacheLife, cacheTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { imageUrl } from "@/lib/images";
import { LISTINGS_TAG } from "./getListings";
import { listingTitle } from "@/features/listings/lib/listing";
import { formatRelativeDay } from "@/lib/utils/format";
import { isPriceDropped } from "@/features/listings/lib/price";

/** Oglas po publicId (zadnji dio URL-a). Vraća null umjesto da baca (use cache). */
export async function getListingByPublicId(publicId: string) {
  "use cache";
  cacheLife("hours"); // updateTag(LISTINGS_TAG) na svaku izmjenu
  cacheTag(LISTINGS_TAG, `listing:${publicId}`);

  const row = await db.query.listings.findFirst({
    where: eq(listings.publicId, publicId),
    with: {
      make: true,
      model: true,
      city: true,
      dealer: { with: { city: true } },
      images: { orderBy: (i, { asc }) => asc(i.sortOrder) },
      features: { with: { feature: true } },
    },
  });
  if (!row || !row.dealer) return null;
  const visible = row.status === "active" || row.status === "sold" || row.status === "expired";
  if (!visible || row.dealer.status !== "active") return null;

  return {
    ...row,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    /** Na nivou dana, računato pri keširanju (stranica je prerenderovana, pa Date.now() ne smije u render). */
    publishedAgo: formatRelativeDay(row.publishedAt, Date.now()),
    /** Oznaka „Cijena snižena" (računato pri keširanju, kao i publishedAgo). */
    priceDropped: isPriceDropped(row, Date.now()),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    soldAt: row.soldAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    title: listingTitle(row.make.name, row.model.name, row.variant),
    gallery: row.images.map((i) => ({
      full: imageUrl(i.storageKey, "full"),
      thumb: imageUrl(i.storageKey, "thumb"),
      width: i.width,
      height: i.height,
    })),
    featureList: row.features.map((f) => f.feature),
    dealer: {
      ...row.dealer,
      createdAt: row.dealer.createdAt.toISOString(),
      updatedAt: row.dealer.updatedAt.toISOString(),
      logo: row.dealer.logoKey ? imageUrl(row.dealer.logoKey, "card") : null,
    },
  };
}
export type ListingDetail = NonNullable<Awaited<ReturnType<typeof getListingByPublicId>>>;
