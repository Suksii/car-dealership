// Demo podaci za razvoj: 3 placa i ~30 oglasa sa generisanim slikama (gradijent + silueta auta).
// Pokretanje: npx tsx scripts/seed-demo.mts   (idempotentno po slug-u placa)
import "dotenv/config";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { processAndStoreImage } from "../src/lib/images";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

const DEALERS = [
  { slug: "auto-centar-podgorica", name: "Auto Centar Podgorica", city: "podgorica", phone: "067 200 100", address: "Cetinjski put bb", email: "demo1@autoplac.me" },
  { slug: "montecar-niksic", name: "MonteCar Nikšić", city: "niksic", phone: "069 300 200", address: "Vuka Karadžića 12", email: "demo2@autoplac.me" },
  { slug: "adriatic-auto-bar", name: "Adriatic Auto Bar", city: "bar", phone: "068 400 300", address: "Bulevar Revolucije 5", email: "demo3@autoplac.me" },
];

type Car = [make: string, model: string, variant: string, year: number, km: number, price: number, fuel: string, trans: string, body: string, kw: number, cc: number, hue: number];
const CARS: Car[] = [
  ["volkswagen","golf","2.0 TDI Highline",2017,148000,12900,"diesel","manual","hatchback",110,1968,215],
  ["volkswagen","passat","2.0 TDI DSG",2019,121000,18500,"diesel","automatic","wagon",140,1968,230],
  ["volkswagen","tiguan","2.0 TDI 4Motion",2018,98000,21900,"diesel","automatic","suv",110,1968,200],
  ["audi","a4","2.0 TDI S-tronic",2018,134000,19900,"diesel","automatic","sedan",140,1968,0],
  ["audi","a3","1.6 TDI",2016,162000,11500,"diesel","manual","hatchback",85,1598,10],
  ["audi","q5","2.0 TDI quattro",2017,145000,24500,"diesel","automatic","suv",140,1968,350],
  ["bmw","serija-3","320d xDrive",2019,89000,26900,"diesel","automatic","sedan",140,1995,210],
  ["bmw","x3","2.0d",2016,171000,19800,"diesel","automatic","suv",140,1995,220],
  ["bmw","serija-1","118d",2015,188000,9900,"diesel","manual","hatchback",110,1995,205],
  ["mercedes-benz","c-klasa","C 220 d",2018,112000,24900,"diesel","automatic","sedan",143,1950,40],
  ["mercedes-benz","a-klasa","A 180 d",2017,129000,16400,"diesel","automatic","hatchback",80,1461,30],
  ["mercedes-benz","glc","220 d 4Matic",2019,97000,33900,"diesel","automatic","suv",143,1950,45],
  ["skoda","octavia","1.6 TDI Ambition",2018,139000,12900,"diesel","manual","wagon",85,1598,120],
  ["skoda","superb","2.0 TDI Style",2017,158000,15900,"diesel","automatic","sedan",110,1968,130],
  ["skoda","kodiaq","2.0 TDI 4x4",2019,102000,24900,"diesel","automatic","suv",110,1968,140],
  ["opel","astra","1.6 CDTI",2017,151000,8900,"diesel","manual","hatchback",81,1598,25],
  ["opel","insignia","2.0 CDTI",2016,176000,9400,"diesel","manual","wagon",125,1956,20],
  ["peugeot","308","1.5 BlueHDi",2019,88000,13200,"diesel","manual","hatchback",96,1499,190],
  ["peugeot","3008","1.6 BlueHDi Allure",2018,119000,17900,"diesel","automatic","suv",88,1560,195],
  ["renault","clio","1.5 dCi",2018,96000,8900,"diesel","manual","hatchback",66,1461,50],
  ["renault","megane","1.5 dCi GT Line",2017,142000,10900,"diesel","manual","hatchback",81,1461,55],
  ["toyota","corolla","1.8 Hybrid",2020,64000,21500,"hybrid","automatic","sedan",90,1798,160],
  ["toyota","yaris","1.5 Hybrid",2021,41000,17900,"hybrid","automatic","hatchback",85,1490,165],
  ["hyundai","tucson","1.6 CRDi",2019,91000,19900,"diesel","manual","suv",100,1598,260],
  ["kia","sportage","1.6 CRDi",2020,72000,21900,"diesel","automatic","suv",100,1598,270],
  ["fiat","500","1.2",2017,78000,7400,"petrol","manual","hatchback",51,1242,340],
  ["ford","focus","1.5 TDCi",2018,131000,10400,"diesel","manual","wagon",88,1499,245],
  ["dacia","duster","1.5 dCi 4x4",2019,84000,13900,"diesel","manual","suv",80,1461,100],
  ["tesla","model-3","Long Range",2021,38000,32900,"electric","automatic","sedan",258,0,0],
  ["volvo","xc60","D4 AWD",2017,152000,22900,"diesel","automatic","suv",140,1969,15],
];

const CAR_SVG = (w: number, h: number) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 160 120">
  <g fill="rgba(255,255,255,0.92)">
    <path d="M22 78 l10-22 c2-4 6-7 11-7 h58 c5 0 9 3 11 7 l10 22 v14 c0 2-2 4-4 4 h-6 c-2 0-4-2-4-4 v-3 H36 v3 c0 2-2 4-4 4 h-6 c-2 0-4-2-4-4z"/>
    <path d="M46 56 c1-3 3-4 6-4 h20 v16 H40z M78 52 h18 c3 0 5 1 6 4 l6 12 H78z" fill="rgba(17,19,24,0.35)"/>
  </g>
  <circle cx="48" cy="90" r="9" fill="#111318"/><circle cx="112" cy="90" r="9" fill="#111318"/>
  <circle cx="48" cy="90" r="4" fill="#fff"/><circle cx="112" cy="90" r="4" fill="#fff"/>
</svg>`;

async function makeImage(hue: number, i: number, label: string) {
  const w = 1600, h = 1200;
  const c1 = `hsl(${hue} 55% 42%)`, c2 = `hsl(${(hue + 40) % 360} 60% 28%)`;
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <text x="80" y="${h - 90}" font-family="sans-serif" font-size="64" font-weight="700" fill="rgba(255,255,255,0.75)">${label} · ${i + 1}</text>
  </svg>`);
  const car = Buffer.from(CAR_SVG(900, 675));
  const jpg = await sharp(bg).composite([{ input: car, left: 350, top: 200 }]).jpeg({ quality: 85 }).toBuffer();
  return processAndStoreImage(jpg, "listings");
}

const hash = await bcrypt.hash("lozinka123", 10);
const cities = Object.fromEntries((await sql`SELECT id, slug FROM cities`).map((r) => [r.slug, r.id]));
const models = await sql`SELECT mo.id, mo.slug, m.slug AS make_slug, m.id AS make_id, m.name AS make_name, mo.name AS model_name FROM models mo JOIN makes m ON m.id = mo.make_id`;
const featureIds = (await sql`SELECT id FROM features`).map((r) => r.id as number);

let n = 0;
for (const [di, d] of DEALERS.entries()) {
  const [user] = await sql`INSERT INTO users (email, name, phone, password_hash, role, email_verified_at)
    VALUES (${d.email}, ${d.name}, ${d.phone}, ${hash}, 'dealer', now())
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id`;
  const [dealer] = await sql`INSERT INTO dealers (owner_user_id, slug, name, city_id, address, phone, viber, status, description)
    VALUES (${user.id}, ${d.slug}, ${d.name}, ${cities[d.city]}, ${d.address}, ${d.phone}, ${d.phone}, 'active', 'Provjerena vozila iz uvoza, mogućnost kredita i zamjene. Demo plac.')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`;
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM listings WHERE dealer_id = ${dealer.id}`;
  if (count > 0) { console.log(`${d.name}: već ima ${count} oglasa, preskačem`); continue; }

  const cars = CARS.filter((_, i) => i % DEALERS.length === di);
  for (const [i, c] of cars.entries()) {
    const m = models.find((r) => r.make_slug === c[0] && r.slug === c[1]);
    if (!m) { console.warn("nema modela", c[0], c[1]); continue; }
    const publicId = Math.random().toString(36).slice(2, 9).replace(/[lo01]/g, "x");
    const slug = `${c[0]}-${c[1]}-${c[2]}-${c[3]}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const daysAgo = Math.floor(Math.random() * 20);
    const [l] = await sql`INSERT INTO listings (public_id, slug, dealer_id, user_id, make_id, model_id, variant, year, mileage_km, fuel, transmission, body_type, drive, engine_cc, power_kw, doors, seats, color, customs_cleared, price_eur, price_negotiable, description, city_id, status, published_at, expires_at, views_count)
      VALUES (${publicId}, ${slug}, ${dealer.id}, ${user.id}, ${m.make_id}, ${m.id}, ${c[2]}, ${c[3]}, ${c[4]}, ${c[6]}, ${c[7]}, ${c[8]}, ${c[8] === "suv" ? "awd" : "fwd"}, ${c[9] || null}, ${c[10]}, 5, 5, ${["Siva", "Crna", "Bijela", "Plava", "Crvena"][i % 5]}, true, ${c[5]}, ${i % 3 === 0},
        ${`${m.make_name} ${m.model_name} ${c[2]}, uvoz iz Njemačke, servisna knjiga, registrovan. Demo oglas.`}, ${cities[d.city]}, 'active', now() - ${daysAgo + " days"}::interval, now() + '60 days'::interval, ${Math.floor(Math.random() * 400)})
      RETURNING id`;
    const imgs = await Promise.all([0, 1, 2].map((k) => makeImage((c[11] + k * 12) % 360, k, `${m.make_name} ${m.model_name}`)));
    for (const [k, img] of imgs.entries()) {
      await sql`INSERT INTO listing_images (listing_id, storage_key, width, height, sort_order) VALUES (${l.id}, ${img.key}, ${img.width}, ${img.height}, ${k})`;
    }
    const picked = featureIds.filter(() => Math.random() < 0.35);
    for (const f of picked) await sql`INSERT INTO listing_features (listing_id, feature_id) VALUES (${l.id}, ${f}) ON CONFLICT DO NOTHING`;
    n++;
  }
  console.log(`${d.name}: ${cars.length} oglasa`);
}
console.log(`gotovo: ${n} novih oglasa`);
await sql.end();
