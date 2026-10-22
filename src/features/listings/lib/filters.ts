import type { ListingFilters } from "@/features/listings/api/getListings";
import { FUEL, TRANSMISSION, BODY, DRIVE, FLAGS, type FlagKey } from "./labels";
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

/** Koraci za cijenu i kilometražu u filterima i pretrazi na naslovnoj; gušći tamo gdje su najčešće granice. */
export const PRICE_STEPS = [
  1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 10000, 12000, 15000, 20000, 25000, 30000, 40000, 50000, 70000, 100000,
] as const;
export const KM_STEPS = [
  10000, 25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 250000, 300000, 400000,
] as const;

/** Snaga od, u KS. */
export const POWER_STEPS = [75, 90, 100, 120, 150, 180, 200, 250, 300] as const;
/** Objavljeno u posljednjih N dana. */
export const PUBLISHED_OPTIONS = [
  { value: "1", label: "Posljednja 24 sata" },
  { value: "7", label: "Posljednjih 7 dana" },
] as const;
export const FLAG_KEYS = Object.keys(FLAGS) as FlagKey[];
/** URL ključevi za prekidače (vrijednost u URL-u je "1"). */
const FLAG_URL: Record<FlagKey, string> = {
  customs: "carinjen",
  undamaged: "neostecen",
  firstOwner: "prvi_vlasnik",
  serviceBook: "servisna",
  tradeIn: "zamjena",
  financing: "kredit",
  warranty: "garancija",
};
const flag = (v: string | string[] | undefined) => (str(v) === "1" ? true : undefined);
const MAX_Q = 60;

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
    drive: manyOf(sp.pogon, Object.keys(DRIVE)),
    powerMinHp: num(sp.ks_od),
    q: str(sp.q)?.trim().replace(/\s+/g, " ").slice(0, MAX_Q) || undefined,
    publishedDays: oneOf(str(sp.objavljeno), ["1", "7"]) ? Number(str(sp.objavljeno)) : undefined,
    ...Object.fromEntries(FLAG_KEYS.map((k) => [k, flag(sp[FLAG_URL[k]])])),
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
  drive: "pogon",
  powerMinHp: "ks_od",
  q: "q",
  publishedDays: "objavljeno",
  ...FLAG_URL,
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
    if (typeof v === "boolean") {
      if (v) q.set(urlKey, "1");
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
      "drive",
      "powerMinHp",
      "q",
      "publishedDays",
      ...FLAG_KEYS,
    ] as const
  ).filter((k) => {
    const v = f[k];
    return Array.isArray(v) ? v.length > 0 : v !== undefined && v !== false;
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
  const pushEach = (
    key: "model" | "city" | "fuel" | "transmission" | "body" | "drive",
    labelOf: (v: string) => string,
  ) => {
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
  if (f.q) push("q", `„${f.q}"`);
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
  pushEach("drive", (v) => DRIVE[v as keyof typeof DRIVE] ?? v);
  if (f.powerMinHp) push("powerMinHp", `od ${f.powerMinHp} KS`);
  if (f.publishedDays)
    push("publishedDays", f.publishedDays === 1 ? "Posljednja 24 sata" : `Posljednjih ${f.publishedDays} dana`);
  for (const k of FLAG_KEYS) if (f[k]) push(k, FLAGS[k]);
  return chips;
}
