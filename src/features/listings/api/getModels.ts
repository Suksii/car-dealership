import { cacheLife, cacheTag } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { models } from "@/db/schema";

export type SlimModel = { id: number; makeId: number; name: string; slug: string };

/** Modeli jedne marke; učitavaju se tek kad korisnik izabere marku (443 modela ne idu u svaki HTML). */
export async function getModelsForMake(makeId: number): Promise<SlimModel[]> {
  "use cache";
  cacheLife("days");
  cacheTag("catalog");
  return db
    .select({ id: models.id, makeId: models.makeId, name: models.name, slug: models.slug })
    .from(models)
    .where(eq(models.makeId, makeId))
    .orderBy(asc(models.name));
}
