"use client";

import { useRouter } from "next/navigation";
import Select from "@/features/shared/components/ui/Select";
import { SORT_OPTIONS, filtersToQuery } from "@/features/listings/lib/filters";
import { useListingsTransition } from "@/features/listings/components/ListingsTransition";
import type { ListingFilters } from "@/features/listings/api/getListings";

export default function SortSelect({
  filters,
  basePath = "/automobili",
}: {
  filters: ListingFilters;
  basePath?: string;
}) {
  const router = useRouter();
  const { startTransition } = useListingsTransition();
  return (
    <div className="w-56">
      <Select
        size="sm"
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
