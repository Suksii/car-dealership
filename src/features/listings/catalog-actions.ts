"use server";

import { z } from "zod";
import { getModelsForMake, type SlimModel } from "@/features/listings/api/getModels";

/** Klijent (SearchBox, filteri) traži modele kad se izabere marka. Keširano u getModelsForMake. */
export async function loadModels(makeId: number): Promise<SlimModel[]> {
  const id = z.number().int().positive().safeParse(makeId);
  return id.success ? getModelsForMake(id.data) : [];
}
