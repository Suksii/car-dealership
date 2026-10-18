import { cacheLife } from "next/cache";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { cities, makes, models, features } from "@/db/schema";

export async function getCatalog() {
  "use cache";
  cacheLife("days");
  const [cityRows, makeRows, modelRows, featureRows] = await Promise.all([
    db.select().from(cities).orderBy(asc(cities.sortOrder)),
    db.select().from(makes).orderBy(asc(makes.sortOrder), asc(makes.name)),
    db.select().from(models).orderBy(asc(models.name)),
    db.select().from(features).orderBy(asc(features.group), asc(features.sortOrder)),
  ]);
  return { cities: cityRows, makes: makeRows, models: modelRows, features: featureRows };
}
export type Catalog = Awaited<ReturnType<typeof getCatalog>>;
