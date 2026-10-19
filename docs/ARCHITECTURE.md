# Arhitektura — autoplac

Next.js 16 (App Router, RSC, `cacheComponents`) + Postgres (Drizzle) + Auth.js v5

- Tailwind 4. Ovaj dokument pokriva odluke koje se ne vide iz koda.

> Ovo nije Next.js iz navike — prije pisanja koda pročitaj relevantni vodič u
> `node_modules/next/dist/docs/`.

## Domeni (`src/features/`)

| Domen          | Šta drži                                                                                                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth`         | prijava/registracija (forme, server akcije), `pages/AccountPage`                                                                                                                                               |
| `dealer-panel` | panel autoplaca `/plac`: profil, oglasi, upload slika                                                                                                                                                          |
| `listings`     | validacija oglasa (`lib/listing.ts`), labele (`lib/labels.ts`), javna lista i stranica oglasa, `api/` (keširani upiti, sitemap)                                                                                |
| `dealers`      | javna lista placeva i stranica placa, `api/getDealers`                                                                                                                                                         |
| `favorites`    | srce na kartici (`FavoriteButton`), `FavoritesProvider` (stanje po sesiji, `GET /api/favorites`), `/nalog/favoriti`                                                                                            |
| `admin`        | `/admin` (odobravanje/suspenzija/isticanje placeva) i `/admin/oglasi` (skidanje oglasa); `api/` bez keša, `requireAdmin()`                                                                                     |
| `legal`        | `/uslovi`, `/privatnost` (tekst u `pages/`, okvir `LegalPage`, stil `.legal-prose`), `TermsCheckbox` na registraciji naloga i placa → `users/dealers.terms_accepted_at`; datum verzije u `SITE.legalUpdatedAt` |
| `home`         | naslovna                                                                                                                                                                                                       |
| `shared`       | `components/ui/*` (Button, Select, Field, Modal…), `components/layout/*` (Header, Footer)                                                                                                                      |

Svaki domen: `components/` (klijent i server komponente), `pages/` (sastavljene
stranice koje `app/` rute renderuju), `actions.ts` (server akcije), `lib/`
(čisti helperi sa testovima).

## Data sloj

- **Baza direktno iz server komponenti i akcija** kroz `db` (`src/db/index.ts`).
  Nema REST API-ja ni React Query-ja — nema potrebe dok nema mobilne aplikacije.
  Ako se ikad doda, ide u `features/<domen>/api/` po ksport obrascu.
- **DAL** (`src/lib/dal.ts`): `requireSession()`, `getMyDealer()`,
  `requireDealer()`, `requireAdmin()`. Svaka stranica i akcija koja treba korisnika ide kroz DAL,
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

| Ruta                                  | Šta                                                           |
| ------------------------------------- | ------------------------------------------------------------- |
| `/`                                   | naslovna                                                      |
| `/automobili`                         | svi oglasi, filteri u query-ju (`?marka=&model=&cijena_do=…`) |
| `/oglas/[slug]-[publicId]`            | oglas; slug nije jedinstven, publicId jeste                   |
| `/placevi`, `/placevi/[slug]`         | lista placeva, stranica placa                                 |
| `/plac/*`                             | panel autoplaca (zaštićeno)                                   |
| `/prijava`, `/registracija`, `/nalog` | auth                                                          |
| `/admin/*`                            | admin (uloga `admin`)                                         |

## Provjere

`npm run check` = `tsc --noEmit` + `eslint` + `vitest run`. `npm run build`
poslije nove rute; tabela ruta mora ostati `○`/`◐` (statična ljuska), `ƒ` samo
za `/api/*` i `/uploads/*`.

## Procjena cijene

`price_stats` je materijalizovani view (medijan i kvartili po marka/model/godište,
samo aktivni oglasi sa cijenom). `getPriceStat` (`use cache`, `hours`) prvo
traži tačno godište, pa ±1; prikazuje se tek od 3 uporediva oglasa
(`PriceEstimate` na oglasu). Osvježavanje: `scripts/refresh-stats.mts`, u
produkciji cron jednom dnevno.

## SEO

- `src/app/robots.ts` (zabranjeni `/plac`, `/nalog`, `/admin`, `/api`, auth
  stranice) i `src/app/sitemap.ts` (naslovna, lista, placevi, svi aktivni
  oglasi i placevi iz `getSitemapEntries`, keš `hours` sa tagovima, pa se
  osvježava kad plac objavi ili admin promijeni status).
- `src/app/opengraph-image.tsx` je podrazumijevana OG slika; oglas ima svoju
  fotografiju kroz `generateMetadata`.
- Stranica oglasa ima JSON-LD `Car` + `Offer` + `AutoDealer`
  (`ListingDetailPage`). `canonical` na naslovnoj, listi, oglasu i placu.
- Privatne stranice (`/admin`, `/nalog/*`) imaju `robots: { index: false }`.

## Bezbjednost

- Uloga i blokada se čitaju iz baze u `requireSession()` (JWT traje 30 dana,
  pa promjena uloge ili blokada važi odmah). `requireAdmin()` koristi tu ulogu.
- Rate limiting (`src/lib/rate-limit.ts`, u memoriji procesa): u `proxy.ts`
  za POST na `/prijava`, `/registracija`, `/api/upload`; u akcijama za
  `trackView`, `trackContactClick` i prijave oglasa. Za više instanci
  zamijeniti Postgres/Redis implementacijom sa istim API-jem.
- Zaglavlja u `next.config.ts` (`nosniff`, `SAMEORIGIN`, referrer, permissions,
  HSTS u produkciji). CSP nema: Next inline skripte traže nonce po zahtjevu,
  što ruši statične stranice.
- Ključ slike iz forme mora biti našeg formata (`IMAGE_KEY`), zamijenjene slike
  se brišu iz storage-a (`deleteImage`) u `saveListing` i `updateDealer`.
- Oglas koji je admin uklonio (`removed`) plac ne može vratiti ni izmijeniti.
- `safeNextPath` (`features/auth/lib`) štiti od open redirecta posle prijave.
- Produkcija bez `R2_*` odbija upload (`ALLOW_LOCAL_STORAGE=1` samo lokalno).

## Cron (produkcija)

| Skripta                       | Kada         | Šta                                                         |
| ----------------------------- | ------------ | ----------------------------------------------------------- |
| `scripts/expire-listings.mts` | dnevno 03:00 | aktivne oglase sa `expires_at < now()` označi kao `expired` |
| `scripts/refresh-stats.mts`   | dnevno 04:00 | `REFRESH MATERIALIZED VIEW price_stats`                     |

Javne liste i bez crona ne prikazuju istekle oglase (`expires_at > now()` u upitu).
