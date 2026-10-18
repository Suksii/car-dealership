import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { requireDealer } from "@/lib/dal";
import { getCatalog } from "@/lib/catalog";
import { imageUrl } from "@/lib/images";
import ListingForm from "@/features/dealer-panel/components/ListingForm";
import { saveListing } from "@/features/dealer-panel/actions";

export default async function ListingEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // params se čita pod Suspense zbog cacheComponents
  const dealer = await requireDealer();
  const listing = await db.query.listings.findFirst({
    where: and(eq(listings.id, id), eq(listings.dealerId, dealer.id)),
    with: { images: { orderBy: (img, { asc }) => asc(img.sortOrder) }, features: true },
  });
  if (!listing) notFound();
  const catalog = await getCatalog();
  const { images, features, ...row } = listing;
  return (
    <ListingForm
      action={saveListing.bind(null, listing.id)}
      catalog={catalog}
      listing={row}
      images={images.map((i) => ({ key: i.storageKey, url: imageUrl(i.storageKey, "card"), width: i.width ?? undefined, height: i.height ?? undefined }))}
      featureIds={features.map((f) => f.featureId)}
    />
  );
}
