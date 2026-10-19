"use server";

import { z } from "zod";
import { getModelsForMake, type SlimModel } from "@/features/listings/api/getModels";
import { countListings, type ListingFilters } from "@/features/listings/api/getListings";
import { FUEL, TRANSMISSION, BODY } from "@/features/listings/lib/labels";

/** Klijent (SearchBox, filteri) traži modele kad se izabere marka. Keširano u getModelsForMake. */
export async function loadModels(makeId: number): Promise<SlimModel[]> {
  const id = z.number().int().positive().safeParse(makeId);
  return id.success ? getModelsForMake(id.data) : [];
}

const slug = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9-]+$/)
  .optional();
const posInt = z.number().int().positive().optional();
const keys = <T extends Record<string, string>>(m: T) => z.enum(Object.keys(m) as [string, ...string[]]).optional();

const countSchema = z.object({
  make: slug,
  model: slug,
  city: slug,
  dealer: slug,
  priceMin: posInt,
  priceMax: posInt,
  yearMin: posInt,
  yearMax: posInt,
  kmMax: posInt,
  fuel: keys(FUEL),
  transmission: keys(TRANSMISSION),
  body: keys(BODY),
});

/** Broj oglasa za nacrt filtera (sheet na telefonu). Javni podatak, keširan u countListings. */
export async function loadListingCount(filters: ListingFilters): Promise<number | null> {
  const parsed = countSchema.safeParse(filters);
  if (!parsed.success) return null;
  return countListings(parsed.data as ListingFilters);
}
