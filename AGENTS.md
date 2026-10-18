<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Pravila za agente

Ovo važi za svakog agenta i za svaku izmjenu u repou. Projektne specifičnosti su
u `CLAUDE.md`, arhitektura u `docs/ARCHITECTURE.md`, rendering u
`docs/RENDERING.md`, dizajn u `docs/DESIGN.md`.

## Next.js 16

- Kad sumnjaš u API, čitaj `node_modules/next/dist/docs/01-app/` — ne pretpostavljaj.
- `proxy.ts` umjesto middleware-a. `cacheComponents` je uključen: statična ljuska
  + `<Suspense>` za dinamično. `"use cache"` + `cacheLife` za javne podatke
  (šifarnici, javni oglasi), nikad za per-user podatke.
- Bez `export const dynamic/revalidate` segment config-a. Bez `unstable_cache`.
- Server akcije: `"use server"` fajl izvozi samo async funkcije; svaka validira
  ulaz Zod-om i provjerava sesiju kroz `src/lib/dal.ts`.
- Route handleri samo za ono što nije forma (upload, auth callback, servis slika).

## Struktura

```
src/app/                  tanke rute: page.tsx = metadata + <Suspense><FeaturePage/></Suspense>
src/features/<domen>/     components/ pages/ actions.ts lib/ (validacija, labele, helperi)
src/features/shared/      components/ui/*  components/layout/*
src/lib/                  dal.ts catalog.ts storage.ts images.ts utils/ hooks/ motion/
src/db/                   schema.ts (Drizzle), index.ts
src/config/               site.ts (brend, kontakt)
```

- Komponente: PascalCase fajl, default export, props interface iznad.
- Stranica u `app/` nikad ne sadrži logiku ni stilove — samo kompoziciju.
- Prije pisanja novog helpera/hooka/komponente: `grep` u `src/features/shared`,
  `src/lib` i u `/var/www/html/ksport-new`. Kopiraj generičko, ne piši ispočetka.

## Tailwind i dizajn

- Tokeni samo u `@theme` u `src/app/globals.css`. Bez arbitrary vrijednosti u
  JSX-u (`p-[13px]`, `text-[#333]`); novi token ide u `@theme`, ponavljana
  kombinacija u `@utility` ili `@layer components`.
- Boje samo kroz tokene (`bg-accent`, `text-muted`, `border-border`…), nikad
  `zinc-*`/`blue-*` direktno osim `neutral-*` za sive nijanse.
- Inline `style={{}}` samo za dinamičke vrijednosti.
- Mobilni prvo; svaki ekran provjeriti na 375px i 1280px.

## Kvalitet

- `npm run check` (tsc + lint + vitest) prije svakog commita. Testovi su Vitest
  jedinični za čiste module (`foo.test.ts` pored modula), bez komponenti.
- Bez `any`, bez tihog `catch`, bez `console.log` u commitu.
- Commit poruke na našem jeziku, u imperativu, sa Co-Authored-By linijom.
- Tekst nikad kao brat uslovno renderovanog elementa (Chrome Translate ruši
  React `removeChild`) — svaki tekst u svom elementu.
