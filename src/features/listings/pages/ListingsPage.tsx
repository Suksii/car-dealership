import { getCatalog } from "@/lib/catalog";
import { getListings } from "@/features/listings/api/getListings";
import { parseFilters, filtersToQuery, countActiveFilters, activeFilterChips } from "@/features/listings/lib/filters";
import ActiveFilterChips from "@/features/listings/components/ActiveFilterChips";
import ListingCard from "@/features/listings/components/ListingCard";
import ListingFilters from "@/features/listings/components/ListingFilters";
import { ListingsTransitionProvider, ListingsPendingDim } from "@/features/listings/components/ListingsTransition";
import SortSelect from "@/features/listings/components/SortSelect";
import Pagination from "@/features/shared/components/ui/Pagination";
import Breadcrumbs from "@/features/shared/components/ui/Breadcrumbs";
import { pluralSr } from "@/lib/utils/format";

type SP = Record<string, string | string[] | undefined>;

export default async function ListingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [{ makes, models, cities }, result] = await Promise.all([getCatalog(), getListings(filters)]);
  const makeIdSel = makes.find((mk) => mk.slug === filters.make)?.id;
  const slimModels = models
    .filter((m) => m.makeId === makeIdSel)
    .map(({ id, makeId, name, slug }) => ({ id, makeId, name, slug }));
  const activeCount = countActiveFilters(filters);
  const chips = activeFilterChips(filters, { makes, models, cities });
  const makeName = makes.find((m) => m.slug === filters.make)?.name;
  const modelNames = (filters.model ?? [])
    .map((slug) => models.find((m) => m.slug === slug && m.makeId === makeIdSel)?.name)
    .filter(Boolean)
    .join(", ");
  const title = [makeName, modelNames].filter(Boolean).join(" ") || "Polovni automobili";
  const hrefTemplate = `/automobili?${filtersToQuery({ ...filters, page: undefined })}${activeCount || (filters.sort && filters.sort !== "newest") ? "&" : ""}page={page}`;

  return (
    <ListingsTransitionProvider>
      <div className="container-page py-8">
        <Breadcrumbs
          items={[{ label: "Automobili", href: "/automobili" }, ...(makeName ? [{ label: makeName }] : [])]}
        />
        <div className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted mt-1 text-sm">
              {result.total} {pluralSr(result.total, ["oglas", "oglasa", "oglasa"])}
            </p>
          </div>
          <SortSelect filters={filters} className="hidden lg:block" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div>
            <ListingFilters
              key={JSON.stringify(filters)}
              filters={filters}
              makes={makes}
              models={slimModels}
              cities={cities}
              activeCount={activeCount}
              total={result.total}
            >
              <SortSelect filters={filters} className="min-w-0 flex-1" />
            </ListingFilters>
          </div>
          <ListingsPendingDim>
            <ActiveFilterChips chips={chips} className="mb-4 flex flex-wrap gap-2" />
            {result.items.length === 0 ? (
              <div className="border-border bg-surface text-muted rounded-2xl border border-dashed p-12 text-center">
                Nema oglasa za izabrane filtere. Probaj da ukloniš neki filter.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
                {result.items.map((item, i) => (
                  <ListingCard key={item.id} item={item} priority={i < 3} />
                ))}
              </div>
            )}
            <Pagination
              currentPage={result.page}
              lastPage={result.lastPage}
              hrefTemplate={hrefTemplate}
              className="mt-10"
            />
          </ListingsPendingDim>
        </div>
      </div>
    </ListingsTransitionProvider>
  );
}
