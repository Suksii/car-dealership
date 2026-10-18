---
name: design
description: Pravila dizajna i strukture UI-ja za ovaj projekat (tokeni, Tailwind, komponente, stanja). Koristi kad se pravi ili mijenja bilo koja stranica ili komponenta, kad korisnik kaže "dizajn", "izgled", "sredi UI", ili /design.
---

Ti si zadužen za dizajn i strukturu UI-ja u `autoplac`. Pročitaj `docs/DESIGN.md` i `src/app/globals.css` prije rada.

## Struktura

- Reusable komponente idu u `src/features/shared/components/ui/` (PascalCase, default export). Domenske u `src/features/<domen>/components/`.
- Layout stvari (header, footer, kontejneri) u `src/features/shared/components/layout/` ili `app/layout.tsx` — bez duplih padding/margin vrijednosti po stranicama.
- Stranice u `app/` su tanke: metadata + `<Suspense>` + feature stranica. Stilovi i kompozicija žive u `features/<domen>/pages/`.
- Prije nove komponente: provjeri `src/features/shared/components/ui/` i `/var/www/html/ksport-new/features/shared/components/ui/`.

## Tailwind

- Bez arbitrary vrijednosti u JSX-u: ne `p-[2rem]`, `text-[1.5rem]`, `w-[510px]`. Novi token ide u `@theme` u `globals.css`.
- Ponavljane kombinacije klasa → `@utility` (`container-page`, `eyebrow`…); ponavljane komponente → `@layer components` (`.field-control`, `.card`).
- Boje samo tokeni (`bg-accent`, `text-muted`, `border-border`, `bg-surface`); sive nijanse `neutral-*`. Nikad `zinc`, `blue`, `gray`, `slate`, hex.
- Negativne margine samo kroz `@utility`. Inline `style` samo za dinamičke vrijednosti.
- Mobilni prvo (`sm:`, `md:`, `lg:` nadograđuju). Provjeri 375px i 1280px.

## Komponente i stanja

- `Button` za sva dugmad i CTA linkove; `SelectField` za sve liste (nikad nativni `<select>`); `Field`/`TextareaField` za polja; `Badge` za statuse; `Pagination`; `SectionHeader` za naslove sekcija; `Skeleton` za fallback.
- Svaki dinamični dio: Suspense fallback istih dimenzija. Svaka lista: prazno stanje sa akcijom. Svaka forma: greške ispod polja, pending na dugmetu.
- Ikone `lucide-react`, 16px u tekstu, 20px u dugmadima, uvijek `aria-hidden` uz tekst ili `aria-label` bez teksta.
- Animacije samo iz `src/lib/motion/variants.ts`, kratke; bez animacija na dugim listama.

## Tekst

Crnogorski, ijekavica, kratko, bez uzvičnika. Ime sajta samo iz `SITE.name`. Tekst nikad kao brat uslovno renderovanog elementa (svaki tekst u svoj `span`/`p`).

$ARGUMENTS
