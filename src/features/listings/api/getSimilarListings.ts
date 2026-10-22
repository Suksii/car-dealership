import { getListings } from "@/features/listings/api/getListings";
import type { ListingCardItem } from "@/features/listings/lib/card";
import type { BodyKey } from "@/features/listings/lib/labels";

const LIMIT = 4;

/**
 * Slični oglasi za stranicu oglasa: prvo isti model, pa ista karoserija u rasponu cijene ±30%.
 * Koristi keširani getListings, pa ne dodaje nove upite van keša.
 */
export async function getSimilarListings(l: {
  id: string;
  makeSlug: string;
  modelSlug: string;
  bodyType: BodyKey;
  priceEur: number;
  priceOnRequest: boolean;
}): Promise<ListingCardItem[]> {
  const out: ListingCardItem[] = [];
  const add = (items: ListingCardItem[]) => {
    for (const it of items) if (it.id !== l.id && !out.some((o) => o.id === it.id) && out.length < LIMIT) out.push(it);
  };
  add((await getListings({ make: l.makeSlug, model: [l.modelSlug] })).items);
  if (out.length < LIMIT) {
    const range =
      l.priceOnRequest || !l.priceEur
        ? {}
        : { priceMin: Math.floor(l.priceEur * 0.7), priceMax: Math.ceil(l.priceEur * 1.3) };
    add((await getListings({ body: [l.bodyType], ...range })).items);
  }
  return out;
}
