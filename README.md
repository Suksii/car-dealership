# Autoplac (radni naziv)

Oglasnik polovnih automobila za Crnu Goru, okrenut autoplacevima. Next.js 16 + Postgres (Drizzle) + Cloudflare R2.

## Pokretanje

```bash
cp .env.example .env     # upiši DATABASE_URL
npm install
npm run db:migrate       # primijeni migracije iz drizzle/
npm run db:seed          # gradovi, marke, modeli, oprema
npm run dev
```

## Baza

- Izvor istine: `src/db/schema.ts`. Migracije se generišu sa `npm run db:generate`.
- Trigeri i materijalizovani pogled `price_stats` su u `drizzle/0001_triggers_and_views.sql`.
- Seed podaci su u `db/seed_*.sql`; `db/schema.reference.sql` je samo čitljiva referenca.
- Brza provjera baze: `npx tsx scripts/smoke-db.mts` (sve se radi u transakciji i vraća).
- Dev baza: Neon projekat `autoplac` (eu-central-1). Produkcija ide na Hetzner.

## Plan V1

Vidi razgovor / bilješke: oglasi, pretraga, stranice autoplaceva, favoriti, admin, SEO, procjena cijene. Bez poruka, SMS-a i plaćanja.
