import Skeleton from "@/features/shared/components/ui/Skeleton";

/** Prati raspored ListingCard: slika 4:3, naziv, varijanta, red specifikacija, cijena, plac. */
export default function ListingCardSkeleton() {
  return (
    <div className="bg-surface shadow-card ring-border overflow-hidden rounded-2xl ring-1" aria-hidden="true">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3 sm:gap-2.5 sm:p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="hidden h-3.5 w-1/2 sm:block" />
        <Skeleton className="mt-1 h-3.5 w-5/6" />
        <Skeleton className="mt-1 h-6 w-1/3" />
        <Skeleton className="mt-1 h-3 w-3/4" />
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid-listings">
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
