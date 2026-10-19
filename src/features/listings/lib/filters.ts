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
const MAX_VALUES = 20;
/** "a3,a4" -> ["a3","a4"]; bez duplikata i praznih, najviše MAX_VALUES. */
const list = (v: string | string[] | undefined): string[] | undefined => {
  const raw = str(v);
  if (!raw) return undefined;
  const arr = [
    ...new Set(
      raw
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    ),
  ].slice(0, MAX_VALUES);
  return arr.length ? arr : undefined;
};
const manyOf = <T extends string>(v: string | string[] | undefined, keys: readonly string[]): T[] | undefined => {
  const arr = list(v)?.filter((x) => keys.includes(x)) as T[] | undefined;
  return arr?.length ? arr : undefined;
};

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
    model: list(sp.model),
    city: list(sp.grad),
    dealer: str(sp.plac),
    priceMin: num(sp.cijena_od),
    priceMax: num(sp.cijena_do),
    yearMin: num(sp.godiste_od),
    yearMax: num(sp.godiste_do),
    kmMax: num(sp.km_do),
    fuel: manyOf(sp.gorivo, Object.keys(FUEL)),
    transmission: manyOf(sp.mjenjac, Object.keys(TRANSMISSION)),
    body: manyOf(sp.karoserija, Object.keys(BODY)),
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
    if (Array.isArray(v)) {
      if (v.length) q.set(urlKey, v.join(","));
      continue;
    }
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
  ).filter((k) => {
    const v = f[k];
    return Array.isArray(v) ? v.length > 0 : v !== undefined;
  }).length;
}

export interface FilterChip {
  /** "make", "fuel:diesel"… (React key). */
  id: string;
  label: string;
  /** Query string bez tog filtera, odnosno bez te vrijednosti (bez page). */
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
    chips.push({ id: key, label, query: without(key, ...extra) });
  /** Po jedan čip za svaku vrijednost višestrukog filtera; uklanja samo tu vrijednost. */
  const pushEach = (key: "model" | "city" | "fuel" | "transmission" | "body", labelOf: (v: string) => string) => {
    const all: string[] = f[key] ?? [];
    for (const v of all) {
      const rest = all.filter((x) => x !== v);
      chips.push({
        id: `${key}:${v}`,
        label: labelOf(v),
        query: filtersToQuery(f, { [key]: rest.length ? rest : undefined, page: undefined } as Partial<ListingFilters>),
      });
    }
  };

  const nameOf = (list: Named[], slug: string) => list.find((x) => x.slug === slug)?.name ?? slug;
  if (f.make) push("make", nameOf(cat.makes, f.make), "model");
  pushEach("model", (v) => nameOf(cat.models, v));
  if (f.priceMin && f.priceMax)
    chips.push({
      id: "price",
      label: `${formatPrice(f.priceMin)} – ${formatPrice(f.priceMax)}`,
      query: without("priceMin", "priceMax"),
    });
  else if (f.priceMin) push("priceMin", `od ${formatPrice(f.priceMin)}`);
  else if (f.priceMax) push("priceMax", `do ${formatPrice(f.priceMax)}`);
  if (f.yearMin && f.yearMax)
    chips.push({ id: "year", label: `${f.yearMin} – ${f.yearMax}`, query: without("yearMin", "yearMax") });
  else if (f.yearMin) push("yearMin", `od ${f.yearMin}.`);
  else if (f.yearMax) push("yearMax", `do ${f.yearMax}.`);
  if (f.kmMax) push("kmMax", `do ${formatKm(f.kmMax)}`);
  pushEach("fuel", (v) => FUEL[v as keyof typeof FUEL] ?? v);
  pushEach("transmission", (v) => TRANSMISSION[v as keyof typeof TRANSMISSION] ?? v);
  pushEach("body", (v) => BODY[v as keyof typeof BODY] ?? v);
  pushEach("city", (v) => nameOf(cat.cities, v));
  return chips;
}
