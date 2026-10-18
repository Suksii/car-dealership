import Skeleton from "@/features/shared/components/ui/Skeleton";

export default function ListingCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="grid grid-cols-2 gap-2"><Skeleton className="h-3" /><Skeleton className="h-3" /><Skeleton className="h-3" /><Skeleton className="h-3" /></div>
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return <div className="grid-listings">{Array.from({ length: count }, (_, i) => <ListingCardSkeleton key={i} />)}</div>;
}
