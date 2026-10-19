"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { LISTINGS_TAG } from "@/features/listings/api/getListings";
import { DEALERS_TAG } from "@/features/dealers/api/getDealers";
import { db } from "@/db";
import { dealers, users, listings, listingImages, listingFeatures, makes, models } from "@/db/schema";
import { requireSession, getMyDealer } from "@/lib/dal";
import { slugify } from "@/lib/utils/slugify";
import { hoursFromForm } from "@/features/dealers/lib/hours";
import {
  fieldErrors,
  listingFormToObject,
  listingSchema,
  listingSlug,
  newPublicId,
  LISTING_DAYS,
} from "@/features/listings/lib/listing";

export type FormState = { errors?: Record<string, string>; message?: string } | undefined;

// ---------------- plac ----------------
const dealerSchema = z.object({
  name: z.string().trim().min(2, "Unesi naziv placa").max(80),
  cityId: z.coerce.number().int().positive("Izaberi grad"),
  address: z.string().trim().max(120).optional(),
  phone: z.string().trim().min(6, "Unesi telefon").max(30),
  phone2: z.string().trim().max(30).optional(),
  viber: z.string().trim().max(30).optional(),
  /** "1" kad je telefon ujedno i Viber broj (čekboks u formi). */
  viberSame: z.string().optional(),
  whatsapp: z.string().trim().max(30).optional(),
  email: z.preprocess((v) => (v === "" ? undefined : v), z.email("Neispravan email").optional()),
  website: z.string().trim().max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  logo: z.string().optional(),
  cover: z.string().optional(),
  lat: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().min(-90).max(90).optional()),
  lng: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().min(-180).max(180).optional()),
  hours_mon: z.string().trim().max(30).optional(),
  hours_tue: z.string().trim().max(30).optional(),
  hours_wed: z.string().trim().max(30).optional(),
  hours_thu: z.string().trim().max(30).optional(),
  hours_fri: z.string().trim().max(30).optional(),
  hours_sat: z.string().trim().max(30).optional(),
  hours_sun: z.string().trim().max(30).optional(),
});

/** Prvi ključ iz JSON liste ImageUploader-a; undefined = polje nije poslato (ne diraj), null = obrisano. */
function imageKey(raw: string | undefined): string | null | undefined {
  if (raw === undefined) return undefined;
  try {
    return JSON.parse(raw)[0]?.key ?? null;
  } catch {
    return undefined;
  }
}

function dealerValues(d: z.infer<typeof dealerSchema>) {
  const logoKey = imageKey(d.logo);
  const coverKey = imageKey(d.cover);
  const both = d.lat !== undefined && d.lng !== undefined;
  return {
    name: d.name,
    cityId: d.cityId,
    address: d.address || null,
    phone: d.phone,
    phone2: d.phone2 || null,
    viber: d.viber || (d.viberSame ? d.phone : null),
    whatsapp: d.whatsapp || null,
    email: d.email ?? null,
    website: d.website || null,
    description: d.description || null,
    workingHours: hoursFromForm((k) => d[k as keyof typeof d] as string | undefined),
    lat: both ? String(d.lat) : null,
    lng: both ? String(d.lng) : null,
    ...(logoKey !== undefined ? { logoKey } : {}),
    ...(coverKey !== undefined ? { coverKey } : {}),
  };
}

async function uniqueDealerSlug(name: string) {
  const base = slugify(name) || "plac";
  let slug = base;
  for (let i = 2; ; i++) {
    const exists = await db.query.dealers.findFirst({ where: eq(dealers.slug, slug), columns: { id: true } });
    if (!exists) return slug;
    slug = `${base}-${i}`;
  }
}

export async function createDealer(_prev: FormState, fd: FormData): Promise<FormState> {
  const session = await requireSession("/plac/registracija");
  if (await getMyDealer()) redirect("/plac");

  const parsed = dealerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  await db.transaction(async (tx) => {
    await tx.insert(dealers).values({
      ...dealerValues(parsed.data),
      ownerUserId: session.user.id,
      slug: await uniqueDealerSlug(parsed.data.name),
    });
    await tx
      .update(users)
      .set({ role: "dealer" })
      .where(and(eq(users.id, session.user.id), eq(users.role, "private")));
  });
  redirect("/plac");
}

export async function updateDealer(_prev: FormState, fd: FormData): Promise<FormState> {
  const dealer = await getMyDealer();
  if (!dealer) redirect("/plac/registracija");

  const parsed = dealerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  await db.update(dealers).set(dealerValues(parsed.data)).where(eq(dealers.id, dealer.id));
  revalidatePath("/plac");
  updateTag(DEALERS_TAG);
  return { message: "Sačuvano" };
}

// ---------------- oglasi ----------------
export async function saveListing(listingId: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  const session = await requireSession("/plac");
  const dealer = await getMyDealer();
  if (!dealer) redirect("/plac/registracija");

  const parsed = listingSchema.safeParse(listingFormToObject(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const publish = fd.get("intent") === "publish";

  const make = await db.query.makes.findFirst({ where: eq(makes.id, d.makeId) });
  const model = await db.query.models.findFirst({ where: and(eq(models.id, d.modelId), eq(models.makeId, d.makeId)) });
  if (!make || !model) return { errors: { modelId: "Model ne pripada izabranoj marci" } };

  const values = {
    dealerId: dealer.id,
    userId: session.user.id,
    makeId: d.makeId,
    modelId: d.modelId,
    variant: d.variant || null,
    year: d.year,
    mileageKm: d.mileageKm,
    condition: d.condition,
    fuel: d.fuel,
    transmission: d.transmission,
    bodyType: d.bodyType,
    drive: d.drive ?? null,
    engineCc: d.engineCc ?? null,
    powerKw: d.powerKw ?? null,
    doors: d.doors ?? null,
    seats: d.seats ?? null,
    color: d.color || null,
    vin: d.vin || null,
    registeredUntil: d.registeredUntil ?? null,
    customsCleared: d.customsCleared,
    isDamaged: d.isDamaged,
    firstOwner: d.firstOwner,
    priceEur: d.priceOnRequest ? 0 : d.priceEur,
    priceNegotiable: d.priceNegotiable,
    priceOnRequest: d.priceOnRequest,
    description: d.description || null,
    cityId: d.cityId,
    slug: listingSlug(make.name, model.name, d.variant, d.year),
  };

  const now = new Date();
  const expires = new Date(now.getTime() + LISTING_DAYS * 86400_000);

  const id = await db.transaction(async (tx) => {
    let id = listingId;
    if (id) {
      const existing = await tx.query.listings.findFirst({
        where: and(eq(listings.id, id), eq(listings.dealerId, dealer.id)),
      });
      if (!existing) throw new Error("Oglas nije pronađen");
      const statusPatch =
        publish && existing.status !== "active"
          ? { status: "active" as const, publishedAt: now, expiresAt: expires, soldAt: null }
          : {};
      await tx
        .update(listings)
        .set({ ...values, ...statusPatch })
        .where(eq(listings.id, id));
      await tx.delete(listingImages).where(eq(listingImages.listingId, id));
      await tx.delete(listingFeatures).where(eq(listingFeatures.listingId, id));
    } else {
      const [row] = await tx
        .insert(listings)
        .values({
          ...values,
          publicId: newPublicId(),
          ...(publish
            ? { status: "active" as const, publishedAt: now, expiresAt: expires }
            : { status: "draft" as const }),
        })
        .returning({ id: listings.id });
      id = row.id;
    }
    if (d.images.length) {
      await tx.insert(listingImages).values(
        d.images.map((img, i) => ({
          listingId: id!,
          storageKey: img.key,
          width: img.width,
          height: img.height,
          sortOrder: i,
        })),
      );
    }
    if (d.features.length) {
      await tx.insert(listingFeatures).values(d.features.map((featureId) => ({ listingId: id!, featureId })));
    }
    return id!;
  });

  revalidatePath("/plac");
  updateTag(LISTINGS_TAG);
  updateTag(DEALERS_TAG);
  redirect(`/plac?saved=${id}`);
}

export async function setListingStatus(listingId: string, status: "active" | "sold" | "removed") {
  const dealer = await getMyDealer();
  if (!dealer) redirect("/plac/registracija");
  const now = new Date();
  const patch =
    status === "active"
      ? { status, publishedAt: now, expiresAt: new Date(now.getTime() + LISTING_DAYS * 86400_000), soldAt: null }
      : status === "sold"
        ? { status, soldAt: now }
        : { status };
  await db
    .update(listings)
    .set(patch)
    .where(and(eq(listings.id, listingId), eq(listings.dealerId, dealer.id)));
  revalidatePath("/plac");
  updateTag(LISTINGS_TAG);
  updateTag(DEALERS_TAG);
}
