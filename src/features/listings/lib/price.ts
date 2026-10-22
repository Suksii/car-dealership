/** Koliko dana se oglas označava kao „Cijena snižena" poslije sniženja. */
export const PRICE_DROP_DAYS = 30;

type Prev = { priceEur: number; previousPriceEur: number | null; priceOnRequest: boolean };

/**
 * Nova vrijednost za previousPriceEur pri izmjeni oglasa.
 * Sniženje pamti najvišu skorašnju cijenu (više sniženja zaredom ne gube početnu), poskupljenje briše oznaku,
 * ista cijena ne mijenja ništa (`undefined` = ne diraj kolonu).
 */
export function nextPreviousPrice(old: Prev, next: { priceEur: number; priceOnRequest: boolean }) {
  if (next.priceOnRequest || old.priceOnRequest || old.priceEur <= 0) return { previousPriceEur: null };
  if (next.priceEur === old.priceEur) return undefined;
  const reference = Math.max(old.priceEur, old.previousPriceEur ?? 0);
  if (next.priceEur < reference) return { previousPriceEur: reference };
  return { previousPriceEur: null };
}

/** Da li prikazati oznaku sniženja: stara cijena veća od trenutne i promjena skorija od PRICE_DROP_DAYS. */
export function isPriceDropped(
  l: {
    priceEur: number;
    previousPriceEur: number | null;
    priceChangedAt: Date | string | null;
    priceOnRequest: boolean;
  },
  now: number,
): boolean {
  if (l.priceOnRequest || !l.previousPriceEur || l.previousPriceEur <= l.priceEur || !l.priceChangedAt) return false;
  return now - new Date(l.priceChangedAt).getTime() < PRICE_DROP_DAYS * 86400_000;
}
