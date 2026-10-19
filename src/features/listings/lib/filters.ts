import type { ListingFilters } from "@/features/listings/api/getListings";
import { FUEL, TRANSMISSION, BODY } from "./labels";
import { formatPrice, formatKm } from "@/lib/utils/format";

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const num = (v: string | string[] | undefined) => {
  const n = Number(str(v));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
};
const oneOf = <T extends string>(v: string | undefined, keys: readonly string[]): T | undefined =>
  v && keys.includes(v) ? (v as T) : undefined;

export const SORT_OPTIONS = [
  { value: "newest", label: "Najnovije" },
  { value: "price_asc", label: "Cijena: niža prvo" },
  { value: "price_desc", label: "Cijena: viša prvo" },
  { value: "year_desc", label: "Godište: novije prvo" },
  { value: "km_asc", label: "Kilometraža: manja prvo" },
] as const;

/** URL je na našem jeziku (?marka=bmw&cijena_do=10000), filteri interno na engleskom. */
export function parseFilters(sp: SP): ListingFilters {
  return {
    make: str(sp.marka),
    model: str(sp.model),
    city: str(sp.grad),
    dealer: str(sp.plac),
    priceMin: num(sp.cijena_od),
    priceMax: num(sp.cijena_do),
    yearMin: num(sp.godiste_od),
    yearMax: num(sp.godiste_do),
    kmMax: num(sp.km_do),
    fuel: oneOf(str(sp.gorivo), Object.keys(FUEL)),
    transmission: oneOf(str(sp.mjenjac), Object.keys(TRANSMISSION)),
    body: oneOf(str(sp.karoserija), Object.keys(BODY)),
    sort:
      oneOf(
        str(sp.sort),
        SORT_OPTIONS.map((o) => o.value),
      ) ?? "newest",
    page: num(sp.page) ?? 1,
  };
}

const KEYS: Record<keyof Omit<ListingFilters, "page">, string> = {
  make: "marka",
  model: "model",
  city: "grad",
  dealer: "plac",
  priceMin: "cijena_od",
  priceMax: "cijena_do",
  yearMin: "godiste_od",
  yearMax: "godiste_do",
  kmMax: "km_do",
  fuel: "gorivo",
  transmission: "mjenjac",
  body: "karoserija",
  sort: "sort",
};

/** Query string iz filtera (bez page, bez default sorta). */
export function filtersToQuery(f: ListingFilters, overrides: Partial<ListingFilters> = {}): string {
  const q = new URLSearchParams();
  const merged = { ...f, ...overrides };
  for (const [k, urlKey] of Object.entries(KEYS) as [keyof typeof KEYS, string][]) {
    const v = merged[k];
    if (v === undefined || v === "" || (k === "sort" && v === "newest")) continue;
    q.set(urlKey, String(v));
  }
  if (merged.page && merged.page > 1) q.set("page", String(merged.page));
  return q.toString();
}

export function countActiveFilters(f: ListingFilters): number {
  return (
    [
      "make",
      "model",
      "city",
      "dealer",
      "priceMin",
      "priceMax",
      "yearMin",
      "yearMax",
      "kmMax",
      "fuel",
      "transmission",
      "body",
    ] as const
  ).filter((k) => f[k] !== undefined).length;
}

export interface FilterChip {
  key: keyof ListingFilters;
  label: string;
  /** Query string bez tog filtera (bez page). */
  query: string;
}

type Named = { slug: string; name: string };
type ChipCatalog = { makes: Named[]; models: Named[]; cities: Named[] };

/**
 * Aktivni filteri kao čipovi „BMW ×", „do 10.000 € ×"; uklanjanje marke uklanja i model.
 * Opsezi (cijena, godište) se spajaju u jedan čip kad su obje granice zadate.
 */
export function activeFilterChips(f: ListingFilters, cat: ChipCatalog): FilterChip[] {
  const chips: FilterChip[] = [];
  const without = (...keys: (keyof ListingFilters)[]) =>
    filtersToQuery(f, { ...Object.fromEntries(keys.map((k) => [k, undefined])), page: undefined });
  const push = (key: keyof ListingFilters, label: string, ...extra: (keyof ListingFilters)[]) =>
    chips.push({ key, label, query: without(key, ...extra) });

  const nameOf = (list: Named[], slug: string | undefined) => list.find((x) => x.slug === slug)?.name ?? slug;
  if (f.make) push("make", nameOf(cat.makes, f.make) ?? f.make, "model");
  if (f.model) push("model", nameOf(cat.models, f.model) ?? f.model);
  if (f.priceMin && f.priceMax)
    chips.push({
      key: "priceMin",
      label: `${formatPrice(f.priceMin)} – ${formatPrice(f.priceMax)}`,
      query: without("priceMin", "priceMax"),
    });
  else if (f.priceMin) push("priceMin", `od ${formatPrice(f.priceMin)}`);
  else if (f.priceMax) push("priceMax", `do ${formatPrice(f.priceMax)}`);
  if (f.yearMin && f.yearMax)
    chips.push({ key: "yearMin", label: `${f.yearMin} – ${f.yearMax}`, query: without("yearMin", "yearMax") });
  else if (f.yearMin) push("yearMin", `od ${f.yearMin}.`);
  else if (f.yearMax) push("yearMax", `do ${f.yearMax}.`);
  if (f.kmMax) push("kmMax", `do ${formatKm(f.kmMax)}`);
  if (f.fuel) push("fuel", FUEL[f.fuel]);
  if (f.transmission) push("transmission", TRANSMISSION[f.transmission]);
  if (f.body) push("body", BODY[f.body]);
  if (f.city) push("city", nameOf(cat.cities, f.city) ?? f.city);
  return chips;
}
