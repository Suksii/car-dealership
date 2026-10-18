import { getCatalog } from "@/lib/catalog";
import { getListings } from "@/features/listings/api/getListings";
import { parseFilters, filtersToQuery, countActiveFilters } from "@/features/listings/lib/filters";
import ListingCard from "@/features/listings/components/ListingCard";
import ListingFilters from "@/features/listings/components/ListingFilters";
import SortSelect from "@/features/listings/components/SortSelect";
import Pagination from "@/features/shared/components/ui/Pagination";
import Breadcrumbs from "@/features/shared/components/ui/Breadcrumbs";
import { pluralSr } from "@/lib/utils/format";

type SP = Record<string, string | string[] | undefined>;

export default async function ListingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams; // pod Suspense (docs/RENDERING.md, pravilo 1)
  const filters = parseFilters(sp);
  const [{ makes, models, cities }, result] = await Promise.all([getCatalog(), getListings(filters)]);
  const slimModels = models.map(({ id, makeId, name, slug }) => ({ id, makeId, name, slug }));
  const activeCount = countActiveFilters(filters);
  const makeName = makes.find((m) => m.slug === filters.make)?.name;
  const modelName = models.find((m) => m.slug === filters.model && m.makeId === makes.find((mk) => mk.slug === filters.make)?.id)?.name;
  const title = [makeName, modelName].filter(Boolean).join(" ") || "Polovni automobili";
  const hrefTemplate = `/automobili?${filtersToQuery({ ...filters, page: undefined })}${activeCount || (filters.sort && filters.sort !== "newest") ? "&" : ""}page={page}`;

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Automobili", href: "/automobili" }, ...(makeName ? [{ label: makeName }] : [])]} />
      <div className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted">{result.total} {pluralSr(result.total, ["oglas", "oglasa", "oglasa"])}</p>
        </div>
        <SortSelect filters={filters} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div><ListingFilters filters={filters} makes={makes} models={slimModels} cities={cities} activeCount={activeCount} /></div>
        <div>
          {result.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-muted">
              Nema oglasa za izabrane filtere. Probaj da ukloniš neki filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((item, i) => <ListingCard key={item.id} item={item} priority={i < 3} />)}
            </div>
          )}
          <Pagination currentPage={result.page} lastPage={result.lastPage} hrefTemplate={hrefTemplate} className="mt-10" />
        </div>
      </div>
    </div>
  );
}
