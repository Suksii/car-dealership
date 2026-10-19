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

const DAY_MS = 86400_000;

/**
 * Starost na nivou dana, ijekavski: "danas", "juče", "prije 5 dana", "prije 2 sedmice",
 * "prije 3 mjeseca". Ručno, jer ICU za `sr` daje ekavicu ("pre 2 dana").
 */
export function formatRelativeDay(value: Date | string | number | null | undefined, now = Date.now()): string | null {
  if (value == null) return null;
  const t = value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (Number.isNaN(t)) return null;
  const days = Math.max(0, Math.floor((now - t) / DAY_MS));
  if (days === 0) return "danas";
  if (days === 1) return "juče";
  if (days < 7) return `prije ${days} ${pluralSr(days, ["dan", "dana", "dana"])}`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return `prije ${w} ${pluralSr(w, ["sedmicu", "sedmice", "sedmica"])}`;
  }
  if (days < 365) {
    const m = Math.floor(days / 30);
    return `prije ${m} ${pluralSr(m, ["mjesec", "mjeseca", "mjeseci"])}`;
  }
  const y = Math.floor(days / 365);
  return `prije ${y} ${pluralSr(y, ["godinu", "godine", "godina"])}`;
}
