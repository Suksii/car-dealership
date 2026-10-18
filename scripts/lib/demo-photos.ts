// Pexels demo fotografije: ID-jevi su u db/demo/photos.json, keš je storage/demo-cache/<id>.jpg.
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import manifest from "../../db/demo/photos.json" with { type: "json" };

export const CACHE_DIR = "storage/demo-cache";
export const pexelsUrl = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1800`;
export const cachePath = (id: number) => `${CACHE_DIR}/${id}.jpg`;

export async function fetchPhoto(id: number) {
  const path = cachePath(id);
  if (existsSync(path)) return path;
  const res = await fetch(pexelsUrl(id));
  if (!res.ok) throw new Error(`Pexels ${id}: HTTP ${res.status}`);
  await writeFile(path, Buffer.from(await res.arrayBuffer()));
  return path;
}

export const allIds = () => [...new Set([...manifest.hero, ...Object.values(manifest.cars).flat()])];
