@AGENTS.md

# Autoplac — projekt-specifično

Oglasnik polovnih automobila za Crnu Goru, okrenut autoplacevima. Svoj projekat
(nije za klijenta). Radni naziv `autoplac`; ime i domen nisu konačni, pa ime
sajta nigdje ne pisati kao literal — samo kroz `src/config/site.ts`.

- **Referentni projekti za stil i strukturu**: `/var/www/html/ksport-new`
  (primarno), `/var/www/html/tehnoplus-new`, `/var/www/html/lubenicashop-new`.
  Odatle se uzimaju generičke UI komponente, hookovi i obrasci — bez brend
  literala, bez `useT()` prevoda (ovdje nema CMS prevoda, tekst je običan
  crnogorski u kodu). Vidi `docs/ARCHITECTURE.md` i `docs/DESIGN.md`.
- **Struktura**: feature-based, `src/features/<domen>/{components,pages,actions.ts,lib}`;
  `src/app/` drži samo tanke rute; dijeljeno u `src/features/shared/` i `src/lib/`.
- **Baza**: Postgres + Drizzle. Izvor istine je `src/db/schema.ts`; migracije
  `npm run db:generate` → `drizzle/`. Dev baza je Neon (URL u `.env`), produkcija
  Hetzner. `db/schema.reference.sql` je samo čitljiva referenca.
- **Slike**: `POST /api/upload` → `sharp` → tri WebP veličine (`thumb/card/full`).
  Dev: `storage/uploads` + ruta `/uploads/[...path]`; prod: Cloudflare R2 čim
  su `R2_*` u `.env`. Nikad `public/` za upload (ne servira se poslije builda).
- **Auth**: Auth.js v5 (JWT), `src/auth.ts` (sa bazom) i `src/auth.config.ts`
  (bez baze, koristi ga `src/proxy.ts`). Uloge `admin | dealer | private`.
- **Rendering**: `cacheComponents: true`. Sve što čita `cookies()`, `headers()`,
  `searchParams`, `params` ili zove `auth()` ide pod `<Suspense>`, a prije
  `auth()` obavezno `await connection()`. Tvrda pravila u `docs/RENDERING.md`.
- **Jezik**: UI tekst je crnogorski (ijekavica), kod i imena na engleskom.
  Cijene su cijeli euri (`formatPrice`), datumi `sr-Latn-ME`.
- **Demo podaci**: `npx tsx scripts/seed-demo.mts [--reset]` — 3 placa i 30
  oglasa sa pravim fotografijama sa Pexelsa (ID-jevi u `db/demo/photos.json`,
  keš `storage/demo-cache`, preuzimanje `scripts/fetch-demo-photos.mts`).
  Nikad gradijent/placeholder slike u demo podacima; novi model → dodaj ID-jeve.
- **Dev korisnici** (Neon): `test@autoplac.me` (plac „Test Autoplac") i
  `admin@autoplac.me`, lozinka u `scripts/create-test-user.mts`. Korisnik često
  drži `npm run dev` na portu 3000; kolačići za `localhost` se dijele između
  portova, pa prijava na jednom portu mijenja sesiju na drugom.

Prije commit-a: `npm run check` (`tsc`, `lint`, `vitest`) mora proći čisto, a
`npm run build` poslije svake nove rute (tabela ruta: `◐`/`○` očekivano, `ƒ`
samo za API i upload).
