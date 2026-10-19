const LOCALE = "sr-Latn-ME";

/** 11900 -> "11.900 €" (cijene su cijeli euri, bez centi). */
export function formatPrice(eur: number): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(eur) + " €";
}

/** 154000 -> "154.000 km" */
export function formatKm(km: number): string {
  return new Intl.NumberFormat(LOCALE).format(km) + " km";
}

/** kW -> KS (konjske snage), zaokruženo. */
export function kwToHp(kw: number): number {
  return Math.round(kw * 1.35962);
}

const DEFAULT_DATE: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };

/** Lokalizovan datum. Vraća `fallback` za prazne/nevalidne vrijednosti. */
export function formatDate(
  value: string | number | Date | null | undefined,
  options = DEFAULT_DATE,
  fallback = "",
): string {
  if (value == null || value === "") return fallback;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d.toLocaleDateString(LOCALE, options);
}

const pluralRules = new Intl.PluralRules("sr");

/** pluralSr(3, ["oglas", "oglasa", "oglasa"]) -> "oglasa" */
export function pluralSr(count: number, [one, few, other]: [string, string, string]): string {
  const c = pluralRules.select(count);
  return c === "one" ? one : c === "few" ? few : other;
}
