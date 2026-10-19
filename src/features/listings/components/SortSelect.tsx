"use client";

import { useRouter } from "next/navigation";
import Select from "@/features/shared/components/ui/Select";
import { SORT_OPTIONS, filtersToQuery } from "@/features/listings/lib/filters";
import { useListingsTransition } from "@/features/listings/components/ListingsTransition";
import { cn } from "@/lib/utils/cn";
import type { ListingFilters } from "@/features/listings/api/getListings";

export default function SortSelect({
  filters,
  basePath = "/automobili",
  className,
  size = "sm",
}: {
  filters: ListingFilters;
  basePath?: string;
  /** Širina; podrazumijevano w-56. */
  className?: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const { startTransition } = useListingsTransition();
  return (
    <div className={cn(className ?? "w-56")}>
      <Select
        size={size}
        aria-label="Sortiraj"
        options={[...SORT_OPTIONS]}
        value={filters.sort ?? "newest"}
        onChange={(v) => {
          const q = filtersToQuery({ ...filters, sort: v as ListingFilters["sort"], page: 1 });
          startTransition(() => router.push(`${basePath}${q ? `?${q}` : ""}`));
        }}
      />
    </div>
  );
}
