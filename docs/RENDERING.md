# Rendering — tvrda pravila (Next 16, `cacheComponents: true`)

Projekat koristi Cache Components (PPR): svaka ruta se prerenderuje u statičnu
ljusku, a dinamični dijelovi se streamuju kroz `<Suspense>`. Ova pravila su
naučena na ovom i na ksport/tehnoplus projektima; kršenje ruši `next build`.

1. **Runtime API pod Suspense.** `cookies()`, `headers()`, `connection()`,
   `searchParams`, `await params` i sve što ih zove (npr. `auth()`, DAL) mora
   biti u komponenti ispod `<Suspense fallback>`. Stranica u `app/` je uvijek
   `<Suspense><FeaturePage params={params} /></Suspense>` — `params` se
   prosljeđuje kao Promise i čita unutra.
2. **`await connection()` prije `auth()`.** Auth.js zove `crypto.getRandomValues`
   prije čitanja kolačića, pa bez `connection()` prerender puca sa
   „unstable value crypto.getRandomValues()". DAL to već radi; ne zovi `auth()`
   direktno iz stranica.
3. **`searchParams` na klijentu.** Query parametri koje treba forma (npr. `next`
   na prijavi) čitaju se kroz `useSearchParams()` u `"use client"` komponenti
   pod Suspense, ne u server stranici.
4. **`new Date()`, `Math.random()`, `nanoid()` ne u render fazi** server
   komponente van Suspense — ide u module scope (`const YEAR = …`) ili u akciju.
5. **`use cache` ne baca.** Fetcher vraća `null`, `notFound()` zove konzumer.
   Unutar `use cache` nema `cookies()`/`headers()`/per-user argumenata.
6. **Pravi 404 na `[slug]` rutama.** Čim streaming krene, status je 200, a
   za nepoznat param Next 16.4 servira *fallback ljusku* (`◐ /oglas/[slug]`)
   sa 200 prije nego što stranica stigne do `notFound()`. Rješenje koje radi
   (izmjereno na `/oglas/[slug]`): `export const ensureStatic = "navigation"`
   + `generateStaticParams` sa stvarnim slugovima + provjera postojanja na
   keširanim podacima prije prve Suspense granice. Tada se nepoznat slug
   renderuje do kraja prije slanja i vraća 404, a poznati se prerenderuju
   (`○`). Uslov: ruta ne smije čitati `cookies()`/`searchParams` ni imati
   necached podatke. Ruta koja to mora (npr. `/placevi/[slug]` sa sortom u
   query-ju) ostaje soft-404 (200 + `noindex`), što je prihvaćeno.
7. **`redirect()`/`notFound()` nikad u `try/catch`** koji guta grešku, ni u
   `use cache`. U server akciji `signIn()` baca redirect — propusti ga
   (`throw err` ako nije `AuthError`).
8. **`"use client"` što niže.** Samo komponente sa hookovima, event handlerima
   ili browser API-jem. Server komponenta se ne uvozi u klijentsku, ulazi kao
   `children`. Props preko granice serializable (bez `Date`, funkcija osim
   server akcija, Zod šema).
9. **Hidratacija.** Isti izlaz na serveru i klijentu: bez `typeof window` u JSX,
   bez `localStorage` u renderu; browser-only kroz `useSyncExternalStore` sa
   server snapshot-om (`useMediaQuery`, `useIsClient`).
10. **`public/` je build-time.** Fajlovi dodati poslije builda se ne serviraju —
    zato upload ide u `storage/` + route handler, a u produkciji na R2.

11. **Root layout ne smije da suspenduje.** Čim bilo koja Suspense granica u
    stablu krene da streamuje, HTTP status je zakucan na 200, pa `notFound()`
    sa stranice više ne daje 404. Zato header čita sesiju na klijentu
    (`UserMenu` + `useSession`), a ne kroz `auth()` pod Suspense. Isto važi za
    `loading.tsx` iznad `[slug]` ruta.

Provjera: `npm run build` → tabela ruta. `◐` = PPR ljuska (očekivano za sve
stranice sa sesijom), `○` = potpuno statično, `ƒ` = dinamično (samo API).
Greška „encountered uncached or runtime data during prerendering" = pravilo 1.
