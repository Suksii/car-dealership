import type { Metadata } from "next";
import { Suspense } from "react";
import ListingsPage from "@/features/listings/pages/ListingsPage";
import { ListingGridSkeleton } from "@/features/listings/components/ListingCardSkeleton";

export const metadata: Metadata = {
  title: "Polovni automobili",
  description:
    "Pretraži polovne automobile iz svih autoplaceva u Crnoj Gori. Filtriraj po marki, modelu, cijeni, godištu i gradu.",
  alternates: { canonical: "/automobili" },
};

export default function Page({ searchParams }: PageProps<"/automobili">) {
  return (
    <Suspense
      fallback={
        <div className="container-page py-8">
          <div className="mb-8 h-10 w-64 animate-pulse rounded-lg bg-neutral-200/70" />
          <ListingGridSkeleton count={9} />
        </div>
      }
    >
      <ListingsPage searchParams={searchParams} />
    </Suspense>
  );
}
