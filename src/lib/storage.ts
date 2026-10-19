import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join, dirname } from "node:path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Slike se čuvaju pod ključem (npr. "listings/2026/abc123-card.webp").
// Dev: storage/uploads/<key>, servira ih ruta /uploads/[...path] (public/ ne radi za fajlove dodate poslije builda).
// Prod: Cloudflare R2 preko S3 API-ja, servira ih R2_PUBLIC_URL (custom domen ili r2.dev).

export interface Storage {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  remove(key: string): Promise<void>;
  publicUrl(key: string): string;
}

const localStorage: Storage = {
  async put(key, body) {
    const path = join(process.cwd(), "storage", "uploads", key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body);
  },
  async remove(key) {
    await unlink(join(process.cwd(), "storage", "uploads", key)).catch(() => {});
  },
  publicUrl(key) {
    return `/uploads/${key}`;
  },
};

function r2Storage(): Storage {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID!, secretAccessKey: R2_SECRET_ACCESS_KEY! },
  });
  return {
    async put(key, body, contentType) {
      await client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
    },
    async remove(key) {
      await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    },
    publicUrl(key) {
      return `${R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
    },
  };
}

export const LOCAL_UPLOAD_DIR = join(process.cwd(), "storage", "uploads");

export const storage: Storage = process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID ? r2Storage() : localStorage;
