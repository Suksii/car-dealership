import type { ListingFilters } from "@/features/listings/api/getListings";
import { FUEL, TRANSMISSION, BODY } from "./labels";

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const num = (v: string | string[] | undefined) => { const n = Number(str(v)); return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined; };
const oneOf = <T extends string>(v: string | undefined, keys: readonly string[]): T | undefined => (v && keys.includes(v) ? (v as T) : undefined);

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
    sort: oneOf(str(sp.sort), SORT_OPTIONS.map((o) => o.value)) ?? "newest",
    page: num(sp.page) ?? 1,
  };
}

const KEYS: Record<keyof Omit<ListingFilters, "page">, string> = {
  make: "marka", model: "model", city: "grad", dealer: "plac", priceMin: "cijena_od", priceMax: "cijena_do",
  yearMin: "godiste_od", yearMax: "godiste_do", kmMax: "km_do", fuel: "gorivo", transmission: "mjenjac", body: "karoserija", sort: "sort",
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
  return (["make", "model", "city", "dealer", "priceMin", "priceMax", "yearMin", "yearMax", "kmMax", "fuel", "transmission", "body"] as const).filter((k) => f[k] !== undefined).length;
}
