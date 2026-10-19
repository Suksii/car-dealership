import sharp from "sharp";
import { nanoid } from "nanoid";
import { storage } from "./storage";

export type ImageSize = "thumb" | "card" | "full";
export const IMAGE_SIZES: Record<ImageSize, number> = { thumb: 320, card: 800, full: 1600 };

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/** URL za zadatu veličinu. Ključ u bazi je bez sufiksa, npr. "listings/2026/abc123". */
export function imageUrl(key: string, size: ImageSize): string {
  return storage.publicUrl(`${key}-${size}.webp`);
}

/** Obradi upload: tri WebP veličine, vrati osnovni ključ i dimenzije originala. */
export async function processAndStoreImage(
  input: Buffer,
  folder: "listings" | "dealers",
): Promise<{ key: string; width: number; height: number }> {
  const base = sharp(input, { failOn: "none" }).rotate(); // rotate() poštuje EXIF orijentaciju sa telefona
  const meta = await base.metadata();
  if (!meta.width || !meta.height) throw new Error("Neispravna slika");

  const year = new Date().getFullYear();
  const key = `${folder}/${year}/${nanoid(12)}`;

  await Promise.all(
    (Object.keys(IMAGE_SIZES) as ImageSize[]).map(async (size) => {
      const buf = await base
        .clone()
        .resize({ width: IMAGE_SIZES[size], withoutEnlargement: true })
        .webp({ quality: size === "thumb" ? 72 : 80 })
        .toBuffer();
      await storage.put(`${key}-${size}.webp`, buf, "image/webp");
    }),
  );

  return { key, width: meta.width, height: meta.height };
}

export async function deleteImage(key: string) {
  await Promise.all((Object.keys(IMAGE_SIZES) as ImageSize[]).map((s) => storage.remove(`${key}-${s}.webp`)));
}
