// Preuzima sve demo fotografije sa Pexelsa u storage/demo-cache (preskače već preuzete).
// Pokretanje: npx tsx scripts/fetch-demo-photos.mts
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { CACHE_DIR, allIds, cachePath, fetchPhoto } from "./lib/demo-photos";

await mkdir(CACHE_DIR, { recursive: true });
let n = 0;
for (const id of allIds()) {
  const before = existsSync(cachePath(id));
  await fetchPhoto(id);
  if (!before) n++;
}
console.log(`preuzeto ${n} novih, ukupno ${allIds().length}`);
