import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import DealerDetailPage from "@/features/dealers/pages/DealerDetailPage";
import { getDealerBySlug } from "@/features/dealers/api/getDealers";
import { getDealerSlugs } from "@/features/listings/api/getListingSlugs";
import { ListingGridSkeleton } from "@/features/listings/components/ListingCardSkeleton";
import Skeleton from "@/features/shared/components/ui/Skeleton";

export async function generateStaticParams() {
  return (await getDealerSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/placevi/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDealerBySlug(slug);
  if (!d) return { title: "Autoplac nije pronađen" };
  return {
    title: `${d.name} – ${d.city.name}`,
    description: d.description ?? `Ponuda polovnih vozila autoplaca ${d.name}, ${d.city.name}.`,
    alternates: { canonical: `/placevi/${slug}` },
  };
}

export default async function Page({ params, searchParams }: PageProps<"/placevi/[slug]">) {
  const { slug } = await params;
  if (!(await getDealerBySlug(slug))) notFound(); // 404 prije Suspense
  return (
    <Suspense
      fallback={
        <div className="container-page py-8">
          <Skeleton className="mb-8 h-32 rounded-2xl" />
          <ListingGridSkeleton />
        </div>
      }
    >
      <DealerDetailPage params={params} searchParams={searchParams} />
    </Suspense>
  );
}
