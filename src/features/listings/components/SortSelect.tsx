"use client";

import { useRouter } from "next/navigation";
import Select from "@/features/shared/components/ui/Select";
import { SORT_OPTIONS, filtersToQuery } from "@/features/listings/lib/filters";
import type { ListingFilters } from "@/features/listings/api/getListings";

export default function SortSelect({ filters }: { filters: ListingFilters }) {
  const router = useRouter();
  return (
    <div className="w-56">
      <Select size="sm" options={[...SORT_OPTIONS]} value={filters.sort ?? "newest"}
        onChange={(v) => { const q = filtersToQuery({ ...filters, sort: v as ListingFilters["sort"], page: 1 }); router.push(`/automobili${q ? `?${q}` : ""}`); }} />
    </div>
  );
}
