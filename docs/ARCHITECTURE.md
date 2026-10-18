# Arhitektura — autoplac

Next.js 16 (App Router, RSC, `cacheComponents`) + Postgres (Drizzle) + Auth.js v5
+ Tailwind 4. Ovaj dokument pokriva odluke koje se ne vide iz koda.

> Ovo nije Next.js iz navike — prije pisanja koda pročitaj relevantni vodič u
> `node_modules/next/dist/docs/`.

## Domeni (`src/features/`)

| Domen | Šta drži |
|---|---|
| `auth` | prijava/registracija (forme, server akcije), `pages/AccountPage` |
| `dealer-panel` | panel autoplaca `/plac`: profil, oglasi, upload slika |
| `listings` | validacija oglasa (`lib/listing.ts`), labele enuma (`lib/labels.ts`); kasnije javne stranice oglasa |
| `home` | naslovna |
| `shared` | `components/ui/*` (Button, Select, Field, Modal…), `components/layout/*` (Header, Footer) |

Svaki domen: `components/` (klijent i server komponente), `pages/` (sastavljene
stranice koje `app/` rute renderuju), `actions.ts` (server akcije), `lib/`
(čisti helperi sa testovima).

## Data sloj

- **Baza direktno iz server komponenti i akcija** kroz `db` (`src/db/index.ts`).
  Nema REST API-ja ni React Query-ja — nema potrebe dok nema mobilne aplikacije.
  Ako se ikad doda, ide u `features/<domen>/api/` po ksport obrascu.
- **DAL** (`src/lib/dal.ts`): `requireSession()`, `getMyDealer()`,
  `requireDealer()`. Svaka stranica i akcija koja treba korisnika ide kroz DAL,
  ne kroz direktan `auth()`.
- **Šifarnici** (`src/lib/catalog.ts`): `"use cache"` + `cacheLife("days")`.
  Marke, modeli, gradovi, oprema.
- **Javni oglasi** (kad se naprave): `"use cache"` + `cacheLife("minutes")` +
  `cacheTag("listings")`; `revalidateTag` iz akcija koje mijenjaju oglas.
- **Per-user** (sesija, moj plac, moji oglasi, favoriti): nikad `use cache`.

## Auth

JWT sesije; `users`/`accounts` su naše tabele (bez Auth.js adaptera).
`src/auth.config.ts` nema import baze da bi `src/proxy.ts` ostao lagan;
`src/proxy.ts` štiti `/nalog`, `/plac`, `/admin` optimistički (samo kolačić),
prava provjera je u DAL-u. `trustHost: true` jer ide iza Cloudflare/Hetzner.

## Slike

`src/lib/storage.ts` apstrakcija (lokalno ili R2), `src/lib/images.ts`
obrada (`sharp`, EXIF rotacija, 3 WebP veličine). Ključ u bazi je bez sufiksa
(`listings/2026/abc`), `imageUrl(key, size)` gradi URL. Upload ide iz browsera
na `/api/upload` odmah pri izboru fajla, forma šalje samo ključeve.

## URL-ovi

| Ruta | Šta |
|---|---|
| `/` | naslovna |
| `/automobili` | svi oglasi, filteri u query-ju (`?marka=&model=&cijena_do=…`) |
| `/oglas/[slug]-[publicId]` | oglas; slug nije jedinstven, publicId jeste |
| `/placevi`, `/placevi/[slug]` | lista placeva, stranica placa |
| `/plac/*` | panel autoplaca (zaštićeno) |
| `/prijava`, `/registracija`, `/nalog` | auth |
| `/admin/*` | admin (uloga `admin`) |

## Provjere

`npm run check` = `tsc --noEmit` + `eslint` + `vitest run`. `npm run build`
poslije nove rute; tabela ruta mora ostati `○`/`◐` (statična ljuska), `ƒ` samo
za `/api/*` i `/uploads/*`.
