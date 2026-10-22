// Demo podaci za razvoj: 3 placa i 30 oglasa sa pravim fotografijama (Pexels, db/demo/photos.json).
// Pokretanje: npx tsx scripts/seed-demo.mts            (preskače plac koji već ima oglase)
//             npx tsx scripts/seed-demo.mts --reset    (briše demo oglase i slike pa ubacuje ponovo)
import "dotenv/config";
import { readFile, mkdir } from "node:fs/promises";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { processAndStoreImage, deleteImage } from "../src/lib/images";
import { CACHE_DIR, fetchPhoto } from "./lib/demo-photos";
import { newPublicId } from "../src/features/listings/lib/listing";
import photos from "../db/demo/photos.json" with { type: "json" };

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const RESET = process.argv.includes("--reset");

const DEALERS = [
  {
    slug: "auto-centar-podgorica",
    name: "Auto Centar Podgorica",
    city: "podgorica",
    phone: "067 200 100",
    address: "Cetinjski put bb",
    email: "demo1@autoplac.me",
    color: "#1d4ed8",
  },
  {
    slug: "montecar-niksic",
    name: "MonteCar Nikšić",
    city: "niksic",
    phone: "069 300 200",
    address: "Vuka Karadžića 12",
    email: "demo2@autoplac.me",
    color: "#b91c1c",
  },
  {
    slug: "adriatic-auto-bar",
    name: "Adriatic Auto Bar",
    city: "bar",
    phone: "068 400 300",
    address: "Bulevar Revolucije 5",
    email: "demo3@autoplac.me",
    color: "#0f766e",
  },
];

type Car = [
  make: string,
  model: string,
  variant: string,
  year: number,
  km: number,
  price: number,
  fuel: string,
  trans: string,
  body: string,
  kw: number,
  cc: number,
];
const CARS: Car[] = [
  ["volkswagen", "golf", "2.0 TDI Highline", 2017, 148000, 12900, "diesel", "manual", "hatchback", 110, 1968],
  ["volkswagen", "passat", "2.0 TDI DSG", 2019, 121000, 18500, "diesel", "automatic", "sedan", 140, 1968],
  ["volkswagen", "tiguan", "2.0 TDI 4Motion", 2018, 98000, 21900, "diesel", "automatic", "suv", 110, 1968],
  ["audi", "a4", "2.0 TDI S-tronic", 2018, 134000, 19900, "diesel", "automatic", "sedan", 140, 1968],
  ["audi", "a3", "35 TDI S-tronic", 2021, 62000, 26500, "diesel", "automatic", "sedan", 110, 1968],
  ["audi", "q5", "40 TDI quattro", 2021, 71000, 39900, "diesel", "automatic", "suv", 150, 1968],
  ["bmw", "serija-3", "320d xDrive", 2019, 89000, 26900, "diesel", "automatic", "sedan", 140, 1995],
  ["bmw", "x3", "2.0d xDrive", 2018, 141000, 24800, "diesel", "automatic", "suv", 140, 1995],
  ["bmw", "serija-1", "118d", 2015, 188000, 9900, "diesel", "manual", "hatchback", 110, 1995],
  ["mercedes-benz", "c-klasa", "C 220 CDI", 2013, 172000, 13900, "diesel", "automatic", "sedan", 125, 2143],
  ["mercedes-benz", "a-klasa", "A 180 d", 2017, 129000, 16400, "diesel", "automatic", "hatchback", 80, 1461],
  ["mercedes-benz", "glc", "220 d 4Matic", 2020, 77000, 38900, "diesel", "automatic", "suv", 143, 1950],
  ["mercedes-benz", "e-klasa", "E 220 d T-model", 2016, 168000, 19900, "diesel", "automatic", "wagon", 143, 1950],
  ["skoda", "octavia", "2.0 TDI Style", 2021, 58000, 22900, "diesel", "automatic", "sedan", 110, 1968],
  ["skoda", "superb", "2.0 TDI Style", 2017, 158000, 15900, "diesel", "automatic", "sedan", 110, 1968],
  ["opel", "astra", "1.7 CDTI", 2011, 198000, 4900, "diesel", "manual", "hatchback", 81, 1686],
  ["opel", "mokka", "1.2 Turbo Elegance", 2021, 38000, 18900, "petrol", "manual", "suv", 96, 1199],
  ["peugeot", "308", "1.6 HDi", 2012, 176000, 5400, "diesel", "manual", "hatchback", 68, 1560],
  ["peugeot", "3008", "1.6 BlueHDi Allure", 2018, 119000, 17900, "diesel", "automatic", "suv", 88, 1560],
  ["renault", "clio", "1.5 dCi", 2010, 171000, 4200, "diesel", "manual", "hatchback", 63, 1461],
  ["renault", "captur", "1.5 dCi Intens", 2017, 118000, 10900, "diesel", "manual", "suv", 66, 1461],
  ["toyota", "corolla", "1.6 VVT-i", 2012, 139000, 7900, "petrol", "manual", "sedan", 97, 1598],
  ["toyota", "yaris", "1.5 Hybrid", 2018, 81000, 13900, "hybrid", "automatic", "hatchback", 74, 1497],
  ["hyundai", "tucson", "1.6 CRDi 48V", 2022, 29000, 27900, "diesel", "automatic", "suv", 100, 1598],
  ["kia", "sportage", "1.6 CRDi", 2020, 72000, 21900, "diesel", "automatic", "suv", 100, 1598],
  ["fiat", "500", "1.2 Lounge", 2017, 78000, 7400, "petrol", "manual", "hatchback", 51, 1242],
  ["ford", "focus", "1.5 TDCi Titanium", 2017, 131000, 9400, "diesel", "manual", "hatchback", 88, 1499],
  ["dacia", "duster", "1.5 dCi 4x4", 2019, 84000, 13900, "diesel", "manual", "suv", 80, 1461],
  ["tesla", "model-3", "Long Range", 2021, 38000, 32900, "electric", "automatic", "sedan", 258, 0],
  ["volvo", "xc60", "D4 AWD", 2017, 152000, 22900, "diesel", "automatic", "suv", 140, 1969],
];

/** Emisiona klasa po godištu (gruba procjena za demo podatke). */
const euroFor = (year: number) => (year >= 2015 ? "euro6" : year >= 2011 ? "euro5" : year >= 2006 ? "euro4" : "euro3");
const COLORS = ["Siva", "Crna", "Bijela", "Plava", "Crvena"];

function monogram(name: string, color: string) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="${color}"/><text x="200" y="232" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="150" font-weight="700" fill="#fff">${initials}</text></svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer();
}

async function listingPhotos(key: string) {
  const ids = (photos.cars as Record<string, number[]>)[key];
  if (!ids?.length) throw new Error(`nema fotografija za ${key} u db/demo/photos.json`);
  const out = [];
  for (const id of ids) {
    const buf = await readFile(await fetchPhoto(id));
    out.push(await processAndStoreImage(buf, "listings"));
  }
  return out;
}

await mkdir(CACHE_DIR, { recursive: true });
const hash = await bcrypt.hash("lozinka123", 10);
const cities = Object.fromEntries((await sql`SELECT id, slug FROM cities`).map((r) => [r.slug, r.id]));
const models =
  await sql`SELECT mo.id, mo.slug, m.slug AS make_slug, m.id AS make_id, m.name AS make_name, mo.name AS model_name FROM models mo JOIN makes m ON m.id = mo.make_id`;
const featureIds = (await sql`SELECT id FROM features`).map((r) => r.id as number);

let n = 0;
for (const [di, d] of DEALERS.entries()) {
  const [user] = await sql`INSERT INTO users (email, name, phone, password_hash, role, email_verified_at)
    VALUES (${d.email}, ${d.name}, ${d.phone}, ${hash}, 'dealer', now())
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id`;
  const [dealer] =
    await sql`INSERT INTO dealers (owner_user_id, slug, name, city_id, address, phone, viber, status, description)
    VALUES (${user.id}, ${d.slug}, ${d.name}, ${cities[d.city]}, ${d.address}, ${d.phone}, ${d.phone}, 'active', 'Provjerena vozila iz uvoza, mogućnost kredita i zamjene. Demo plac.')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id, logo_key`;

  if (RESET) {
    const old =
      await sql`SELECT storage_key FROM listing_images WHERE listing_id IN (SELECT id FROM listings WHERE dealer_id = ${dealer.id})`;
    for (const r of old) await deleteImage(r.storage_key);
    if (dealer.logo_key) await deleteImage(dealer.logo_key);
    await sql`DELETE FROM listings WHERE dealer_id = ${dealer.id}`;
    console.log(`${d.name}: obrisano ${old.length} slika`);
  }

  const [{ count }] = await sql`SELECT count(*)::int AS count FROM listings WHERE dealer_id = ${dealer.id}`;
  if (count > 0) {
    console.log(`${d.name}: već ima ${count} oglasa, preskačem`);
    continue;
  }

  const logo = await processAndStoreImage(await monogram(d.name, d.color), "dealers");
  await sql`UPDATE dealers SET logo_key = ${logo.key} WHERE id = ${dealer.id}`;

  const cars = CARS.filter((_, i) => i % DEALERS.length === di);
  for (const [i, c] of cars.entries()) {
    const m = models.find((r) => r.make_slug === c[0] && r.slug === c[1]);
    if (!m) {
      console.warn("nema modela", c[0], c[1]);
      continue;
    }
    const publicId = newPublicId();
    const slug = `${c[0]}-${c[1]}-${c[2]}-${c[3]}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const daysAgo = Math.floor(Math.random() * 20);
    const [l] =
      await sql`INSERT INTO listings (public_id, slug, dealer_id, user_id, make_id, model_id, variant, year, mileage_km, fuel, transmission, body_type, drive, engine_cc, power_kw, doors, seats, color, customs_cleared, price_eur, price_negotiable, description, city_id, status, published_at, expires_at, views_count, service_book, origin, import_country, emission_class, trade_in, financing, warranty_months, previous_price_eur, price_changed_at)
      VALUES (${publicId}, ${slug}, ${dealer.id}, ${user.id}, ${m.make_id}, ${m.id}, ${c[2]}, ${c[3]}, ${c[4]}, ${c[6]}, ${c[7]}, ${c[8]}, ${c[8] === "suv" ? "awd" : "fwd"}, ${c[10] || null}, ${c[9]}, 5, 5, ${COLORS[i % COLORS.length]}, true, ${c[5]}, ${i % 3 === 0},
        ${`${m.make_name} ${m.model_name} ${c[2]}, uvoz iz Njemačke, servisna knjiga, registrovan do kraja godine. Moguća zamjena i kredit. Demo oglas.`}, ${cities[d.city]}, 'active', now() - ${daysAgo + " days"}::interval, now() + '60 days'::interval, ${Math.floor(Math.random() * 400)},
        ${i % 2 === 0}, ${i % 4 === 3 ? "domestic" : "imported"}, ${i % 4 === 3 ? null : "Njemačka"}, ${euroFor(c[3])},
        ${i % 2 === 0}, ${i % 3 !== 2}, ${i % 4 === 0 ? 12 : null},
        ${i % 5 === 1 ? c[5] + 1000 : null}, ${i % 5 === 1 ? new Date(Date.now() - 3 * 86400_000) : null})
      RETURNING id`;
    const imgs = await listingPhotos(`${c[0]}/${c[1]}`);
    for (const [k, img] of imgs.entries()) {
      await sql`INSERT INTO listing_images (listing_id, storage_key, width, height, sort_order) VALUES (${l.id}, ${img.key}, ${img.width}, ${img.height}, ${k})`;
    }
    const picked = featureIds.filter(() => Math.random() < 0.35);
    for (const f of picked)
      await sql`INSERT INTO listing_features (listing_id, feature_id) VALUES (${l.id}, ${f}) ON CONFLICT DO NOTHING`;
    n++;
  }
  console.log(`${d.name}: ${cars.length} oglasa`);
}
console.log(`gotovo: ${n} novih oglasa`);
await sql.end();
