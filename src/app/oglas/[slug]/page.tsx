import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ListingDetailPage, { publicIdFromSlug } from "@/features/listings/pages/ListingDetailPage";
import { getListingByPublicId } from "@/features/listings/api/getListing";
import { getRecentListingSlugs } from "@/features/listings/api/getListingSlugs";
import { formatPrice } from "@/lib/utils/format";
import Skeleton from "@/features/shared/components/ui/Skeleton";

export async function generateStaticParams() {
  return (await getRecentListingSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/oglas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const l = await getListingByPublicId(publicIdFromSlug(slug)); // isti keš zapis kao stranica
  if (!l) return { title: "Oglas nije pronađen" };
  const price = l.priceOnRequest ? "cijena na upit" : formatPrice(l.priceEur);
  return {
    title: `${l.title} ${l.year} – ${price}`,
    description: `${l.title}, ${l.year}. godište, ${l.mileageKm.toLocaleString("sr-Latn-ME")} km. ${l.dealer.name}, ${l.dealer.city.name}.`,
    alternates: { canonical: `/oglas/${slug}` },
    openGraph: { images: l.gallery[0] ? [l.gallery[0].full] : [] },
  };
}

export default async function Page({ params }: PageProps<"/oglas/[slug]">) {
  // Provjera postojanja PRIJE Suspense granice, da 404 bude pravi 404 (ne 200). Isti keširani upit kao stranica.
  const { slug } = await params;
  if (!(await getListingByPublicId(publicIdFromSlug(slug)))) notFound();
  return (
    <Suspense fallback={<div className="container-page py-8"><div className="grid gap-8 lg:grid-cols-[1fr_380px]"><Skeleton className="aspect-[4/3] rounded-2xl" /><Skeleton className="h-80 rounded-2xl" /></div></div>}>
      <ListingDetailPage params={params} />
    </Suspense>
  );
}
