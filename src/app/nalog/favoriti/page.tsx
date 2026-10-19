import type { Metadata } from "next";
import { Suspense } from "react";
import FavoritesPage from "@/features/favorites/pages/FavoritesPage";
import { ListingGridSkeleton } from "@/features/listings/components/ListingCardSkeleton";

export const metadata: Metadata = { title: "Sačuvani oglasi", robots: { index: false } };

export default function Page() {
  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Sačuvani oglasi</h1>
      <Suspense fallback={<ListingGridSkeleton count={6} />}>
        <FavoritesPage />
      </Suspense>
    </div>
  );
}
