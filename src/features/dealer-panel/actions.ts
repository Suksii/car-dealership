"use server";

import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { LISTINGS_TAG } from "@/features/listings/api/getListings";
import { DEALERS_TAG } from "@/features/dealers/api/getDealers";
import { db } from "@/db";
import { dealers, users, listings, listingImages, listingFeatures, makes, models, cities } from "@/db/schema";
import { requireSession, getMyDealer } from "@/lib/dal";
import { slugify } from "@/lib/utils/slugify";
import { deleteImage } from "@/lib/images";
import { IMAGE_KEY } from "@/features/listings/lib/listing";
import { hoursFromForm } from "@/features/dealers/lib/hours";
import { normalizeTaxId } from "@/features/dealers/lib/taxId";
import { nextPreviousPrice } from "@/features/listings/lib/price";
import { ADMIN_EMAIL, sendEmail } from "@/lib/email/send";
import { newDealerEmail } from "@/lib/email/templates";
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
const dealerSchema = z
  .object({
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
    website: z.preprocess(
      (v) => (typeof v === "string" && v.trim() && !/^https?:\/\//i.test(v.trim()) ? `https://${v.trim()}` : v),
      z.union([z.literal(""), z.url("Neispravan link").max(120)]).optional(),
    ),
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
    /** Samo pri registraciji placa (createDealer traži "on"). */
    terms: z.string().optional(),
    /** PIB, opcion; u profilu prazno = ne mijenjaj. */
    taxId: z
      .string()
      .optional()
      .refine((v) => !v?.trim() || normalizeTaxId(v) !== null, "PIB ima 8 cifara"),
  })
  .refine((d) => (d.lat === undefined) === (d.lng === undefined), { path: ["lng"], message: "Unesi obje koordinate" });

/** Prvi ključ iz JSON liste ImageUploader-a; undefined = polje nije poslato (ne diraj), null = obrisano. */
function imageKey(raw: string | undefined): string | null | undefined {
  if (raw === undefined) return undefined;
  try {
    const key = JSON.parse(raw)[0]?.key ?? null;
    return key === null || IMAGE_KEY.safeParse(key).success ? key : undefined;
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
  if (!session.user.emailVerified)
    return { message: "Prvo potvrdi email adresu (link je u emailu poslije registracije)." };

  const parsed = dealerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  // PIB je opcion (i neregistrovani placevi mogu da objavljuju); sa PIB-om plac može dobiti oznaku „Provjeren plac".
  const taxId = normalizeTaxId(parsed.data.taxId);
  if (parsed.data.terms !== "on") return { errors: { terms: "Moraš prihvatiti uslove za autoplaceve" } };

  await db.transaction(async (tx) => {
    await tx.insert(dealers).values({
      termsAcceptedAt: new Date(),
      taxId,
      ...dealerValues(parsed.data),
      ownerUserId: session.user.id,
      slug: await uniqueDealerSlug(parsed.data.name),
    });
    await tx
      .update(users)
      .set({ role: "dealer" })
      .where(and(eq(users.id, session.user.id), eq(users.role, "private")));
  });
  // Obavještenje adminu da plac čeka odobrenje; neuspjeh slanja ne obara registraciju.
  const city = await db.query.cities.findFirst({ where: eq(cities.id, parsed.data.cityId), columns: { name: true } });
  await sendEmail({
    to: ADMIN_EMAIL,
    ...newDealerEmail({
      name: parsed.data.name,
      city: city?.name ?? "",
      phone: parsed.data.phone,
      ownerEmail: session.user.email ?? "",
      taxId,
    }),
  });
  redirect("/plac");
}

export async function updateDealer(_prev: FormState, fd: FormData): Promise<FormState> {
  const dealer = await getMyDealer();
  if (!dealer) redirect("/plac/registracija");

  const parsed = dealerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const values = dealerValues(parsed.data);
  // Novi PIB poništava provjeru: admin mora ponovo potvrditi firmu.
  const taxId = normalizeTaxId(parsed.data.taxId);
  const taxPatch = taxId && taxId !== dealer.taxId ? { taxId, verifiedAt: null } : {};
  await db
    .update(dealers)
    .set({ ...values, ...taxPatch })
    .where(eq(dealers.id, dealer.id));
  // Zamijenjen logo/naslovna: stari fajlovi se brišu iz storage-a da ne ostaju siročići.
  for (const [oldKey, newKey] of [
    [dealer.logoKey, values.logoKey],
    [dealer.coverKey, values.coverKey],
  ] as const) {
    if (oldKey && newKey !== undefined && newKey !== oldKey) await deleteImage(oldKey);
  }
  revalidatePath("/plac");
  updateTag(DEALERS_TAG);
  updateTag(LISTINGS_TAG); // ime/telefon/logo placa su u keširanim stranicama oglasa
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
    serviceBook: d.serviceBook,
    origin: d.origin ?? null,
    importCountry: d.origin === "imported" ? d.importCountry || null : null,
    emissionClass: d.emissionClass ?? null,
    tradeIn: d.tradeIn,
    financing: d.financing,
    warrantyMonths: d.warrantyMonths ?? null,
    priceEur: d.priceOnRequest ? 0 : d.priceEur,
    priceNegotiable: d.priceNegotiable,
    priceOnRequest: d.priceOnRequest,
    description: d.description || null,
    cityId: d.cityId,
    slug: listingSlug(make.name, model.name, d.variant, d.year),
  };

  const now = new Date();
  const expires = new Date(now.getTime() + LISTING_DAYS * 86400_000);
  const removedKeys: string[] = [];

  const id = await db.transaction(async (tx) => {
    let id = listingId;
    if (id) {
      const existing = await tx.query.listings.findFirst({
        where: and(eq(listings.id, id), eq(listings.dealerId, dealer.id)),
      });
      if (!existing) throw new Error("Oglas nije pronađen");
      if (existing.status === "removed") throw new Error("Oglas je uklonjen i ne može se mijenjati");
      const statusPatch =
        publish && existing.status !== "active"
          ? { status: "active" as const, publishedAt: now, expiresAt: expires, soldAt: null }
          : {};
      // Sniženje cijene: pamti staru cijenu za oznaku „Cijena snižena" (src/features/listings/lib/price.ts).
      const prev = nextPreviousPrice(existing, { priceEur: values.priceEur, priceOnRequest: values.priceOnRequest });
      const pricePatch = prev ? { ...prev, priceChangedAt: now } : {};
      await tx
        .update(listings)
        .set({ ...values, ...statusPatch, ...pricePatch })
        .where(eq(listings.id, id));
      const old = await tx
        .delete(listingImages)
        .where(eq(listingImages.listingId, id))
        .returning({ key: listingImages.storageKey });
      removedKeys.push(...old.map((o) => o.key).filter((k) => !d.images.some((img) => img.key === k)));
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

  for (const key of removedKeys) await deleteImage(key);
  revalidatePath("/plac");
  updateTag(LISTINGS_TAG);
  updateTag(DEALERS_TAG);
  redirect(`/plac?saved=${id}`);
}

const statusInput = z.object({ listingId: z.uuid(), status: z.enum(["active", "sold", "removed"]) });

export async function setListingStatus(listingId: string, status: "active" | "sold" | "removed") {
  const dealer = await getMyDealer();
  if (!dealer) redirect("/plac/registracija");
  const input = statusInput.parse({ listingId, status });
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
    // Oglas koji je admin uklonio plac ne može vratiti (status removed ostaje).
    .where(
      and(eq(listings.id, input.listingId), eq(listings.dealerId, dealer.id), sql`${listings.status} <> 'removed'`),
    );
  revalidatePath("/plac");
  updateTag(LISTINGS_TAG);
  updateTag(DEALERS_TAG);
}
