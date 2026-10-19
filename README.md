# Autoplac (radni naziv)

Oglasnik polovnih automobila za Crnu Goru, okrenut autoplacevima. Next.js 16 (App Router, Cache Components) + Postgres (Drizzle) + Auth.js + Tailwind 4 + Cloudflare R2.

## Pokretanje

```bash
cp .env.example .env     # DATABASE_URL, AUTH_SECRET, (AUTH_GOOGLE_*, R2_*)
npm install
npm run db:migrate       # migracije iz drizzle/
npm run db:seed          # gradovi, marke, modeli, oprema
npx tsx scripts/seed-demo.mts          # 3 demo placa + 30 oglasa sa pravim fotografijama (Pexels)
npx tsx scripts/seed-demo.mts --reset  # obriši demo oglase i slike pa ubaci ponovo
npx tsx scripts/refresh-stats.mts      # osvježi price_stats (procjena cijene); u produkciji cron jednom dnevno
npm run dev
```

Provjere prije commita: `npm run check` (tsc + lint + vitest), `npm run build` poslije nove rute.

## Struktura

```
src/app/            tanke rute (metadata + Suspense + feature stranica)
src/features/       auth, dealer-panel, listings, home, shared (ui + layout)
src/lib/            dal, catalog, storage, images, utils, hooks, motion
src/db/             Drizzle šema i klijent
src/config/site.ts  brend i kontakt
docs/               ARCHITECTURE.md, RENDERING.md, DESIGN.md
.claude/agents/     projektni agenti (review, rendering, seo, security, design...)
```

Pravila za rad su u `CLAUDE.md` i `AGENTS.md`.

## Baza

- Izvor istine: `src/db/schema.ts`; migracije `npm run db:generate`.
- Trigeri i `price_stats` pogled: `drizzle/0001_triggers_and_views.sql`.
- Seed: `db/seed_*.sql`. Dev baza je Neon, produkcija Hetzner.
- Brza provjera baze: `npx tsx scripts/smoke-db.mts`.
