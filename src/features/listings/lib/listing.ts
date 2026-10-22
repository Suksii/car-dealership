import { z } from "zod";
import { customAlphabet } from "nanoid";
import { slugify } from "@/lib/utils/slugify";
import { FUEL, TRANSMISSION, BODY, DRIVE, CONDITION, ORIGIN, EMISSION } from "./labels";

export const LISTING_DAYS = 60;
export const MAX_IMAGES = 15;

const publicIdGen = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789", 7);
export const newPublicId = () => publicIdGen();

const emptyToUndef = (v: unknown) => (v === "" || v === null ? undefined : v);
const optInt = (min: number, max: number) =>
  z.preprocess(emptyToUndef, z.coerce.number().int().min(min).max(max).optional());
const bool = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
const keys = <T extends Record<string, string>>(o: T) =>
  z.enum(Object.keys(o) as [keyof T & string, ...(keyof T & string)[]]);

/** Ključ slike kakav pravi processAndStoreImage: folder/godina/nanoid(12). Štiti od tuđih/izmišljenih ključeva. */
export const IMAGE_KEY = z.string().regex(/^(listings|dealers)\/\d{4}\/[A-Za-z0-9_-]{12}$/, "Neispravna slika");

export const listingSchema = z
  .object({
    makeId: z.coerce.number().int().positive("Izaberi marku"),
    modelId: z.coerce.number().int().positive("Izaberi model"),
    variant: z.string().trim().max(80).optional(),
    year: z.coerce
      .number()
      .int()
      .min(1950, "Neispravno godište")
      .max(new Date().getFullYear() + 1, "Neispravno godište"),
    mileageKm: z.coerce.number().int().min(0, "Unesi kilometražu").max(2_000_000),
    condition: keys(CONDITION),
    fuel: keys(FUEL),
    transmission: keys(TRANSMISSION),
    bodyType: keys(BODY),
    drive: z.preprocess(emptyToUndef, keys(DRIVE).optional()),
    engineCc: optInt(50, 10000),
    powerKw: optInt(5, 1500),
    doors: optInt(2, 6),
    seats: optInt(1, 9),
    color: z.string().trim().max(40).optional(),
    vin: z.string().trim().max(17).optional(),
    registeredUntil: z.preprocess(emptyToUndef, z.iso.date().optional()),
    customsCleared: bool,
    isDamaged: bool,
    firstOwner: bool,
    serviceBook: bool,
    origin: z.preprocess(emptyToUndef, keys(ORIGIN).optional()),
    importCountry: z.string().trim().max(40).optional(),
    emissionClass: z.preprocess(emptyToUndef, keys(EMISSION).optional()),
    tradeIn: bool,
    financing: bool,
    warrantyMonths: optInt(1, 120),
    priceEur: z.preprocess(emptyToUndef, z.coerce.number().int().min(0).max(5_000_000).optional()).default(0),
    priceNegotiable: bool,
    priceOnRequest: bool,
    description: z.string().trim().max(5000).optional(),
    cityId: z.coerce.number().int().positive("Izaberi grad"),
    features: z.array(z.coerce.number().int()).default([]),
    images: z
      .array(z.object({ key: IMAGE_KEY, width: z.number().int().optional(), height: z.number().int().optional() }))
      .max(MAX_IMAGES, `Najviše ${MAX_IMAGES} slika`),
  })
  .refine((d) => d.priceOnRequest || d.priceEur > 0, {
    path: ["priceEur"],
    message: "Unesi cijenu ili označi 'cijena na upit'",
  });

export type ListingInput = z.infer<typeof listingSchema>;

/** FormData -> objekat za zod (nizovi i JSON polja). */
export function listingFormToObject(fd: FormData): Record<string, unknown> {
  const o: Record<string, unknown> = Object.fromEntries(fd);
  o.features = fd.getAll("features");
  try {
    o.images = JSON.parse(String(fd.get("images") ?? "[]"));
  } catch {
    o.images = [];
  }
  return o;
}

export function listingSlug(make: string, model: string, variant: string | undefined, year: number) {
  return slugify([make, model, variant, year].filter(Boolean).join(" ")).slice(0, 80);
}

export function listingTitle(make: string, model: string, variant: string | null | undefined) {
  return [make, model, variant].filter(Boolean).join(" ");
}

export function listingPath(slug: string, publicId: string) {
  return `/oglas/${slug}-${publicId}`;
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
