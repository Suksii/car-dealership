import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLatestListings } from "@/features/listings/api/getListings";
import { getDealers } from "@/features/dealers/api/getDealers";
import ListingCard from "@/features/listings/components/ListingCard";
import { ListingGridSkeleton } from "@/features/listings/components/ListingCardSkeleton";
import DealerCard from "@/features/dealers/components/DealerCard";
import Skeleton from "@/features/shared/components/ui/Skeleton";
import Hero from "@/features/home/components/Hero";
import BodyTypes from "@/features/home/components/BodyTypes";
import DealerCta from "@/features/home/components/DealerCta";

function SectionTitle({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="text-xl font-extrabold tracking-tight md:text-2xl">{title}</h2>
      <Link
        href={href}
        className="text-foreground hover:text-accent inline-flex shrink-0 items-center gap-1 text-sm font-semibold"
      >
        <span>{linkLabel}</span>
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}

async function LatestListings() {
  const items = await getLatestListings(8);
  if (items.length === 0) return <p className="text-muted">Još nema oglasa.</p>;
  return (
    <div className="grid-listings">
      {items.map((item, i) => (
        <ListingCard key={item.id} item={item} priority={i < 4} />
      ))}
    </div>
  );
}

async function Dealers() {
  const dealers = (await getDealers()).slice(0, 6);
  if (dealers.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {dealers.map((d) => (
        <DealerCard key={d.id} dealer={d} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div className="bg-foreground h-[560px]" />}>
        <Hero />
      </Suspense>

      <section className="container-page mt-10 md:mt-14">
        <SectionTitle title="Pretraži po karoseriji" href="/automobili" linkLabel="Svi automobili" />
        <Suspense
          fallback={
            <div className="row-scroll">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="aspect-[5/4] w-40 shrink-0 rounded-2xl lg:w-auto lg:max-w-64 lg:flex-1" />
              ))}
            </div>
          }
        >
          <BodyTypes />
        </Suspense>
      </section>

      <section className="container-page mt-14 md:mt-20">
        <SectionTitle title="Najnoviji oglasi" href="/automobili" linkLabel="Pogledaj sve" />
        <Suspense fallback={<ListingGridSkeleton />}>
          <LatestListings />
        </Suspense>
      </section>

      <section className="container-page mt-14 md:mt-20">
        <SectionTitle title="Autoplacevi" href="/placevi" linkLabel="Svi placevi" />
        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          }
        >
          <Dealers />
        </Suspense>
      </section>

      <section className="container-page mt-14 md:mt-20">
        <DealerCta />
      </section>
    </>
  );
}
