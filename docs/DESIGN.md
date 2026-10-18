# Dizajn — autoplac

Cilj: moderan, pregledan, brz, i da ne liči na generički „AI“ sajt. Referentni
izgled je `/var/www/html/ksport-new` (bijele kartice sa mekom sjenkom,
zaobljeni uglovi, puno prostora, jedan akcenat), prilagođen oglasniku:
**fotografija vozila je glavni element** svake kartice i naslovne.

## Šta se ne radi (prepoznatljivi „AI“ obrasci)

- Tamni hero sa radijalnim sjajem i gradijent pozadine umjesto fotografije.
- Red od tri kartice sa ikonom u obojenom kvadratu i generičkim tekstom.
- Ikone uz svaku specifikaciju na kartici; specifikacije su jedan red teksta
  razdvojen tačkom (`2019 · 89.000 km · Dizel · Automatski`).
- Uppercase „eyebrow“ iznad svakog naslova; naslov sekcije je sam, sa jednim
  tekstualnim linkom desno (`SectionTitle` u `HomePage`).
- Placeholder/gradijent slike u demo podacima — demo koristi prave fotografije.

## Tokeni (`src/app/globals.css` → `@theme`)

| Token | Upotreba |
|---|---|
| `foreground` #111318 | tekst, tamna dugmad, znak loga |
| `background` #f5f5f6 | pozadina stranice |
| `surface` #fff | kartice, header, forme |
| `muted` | sekundarni tekst, labele |
| `border` | 10% foreground, sve ivice |
| `accent` #2457f5 | CTA, linkovi na hover, aktivno stanje, tačka u logu |
| `success` / `warning` / `danger` | statusi oglasa i placa, greške |
| `shadow-card`, `shadow-custom` | kartice, dropdown-i |

Utility klase: `container-page` (max 7xl), `container-narrow` (3xl),
`container-box` (bijela kartica sa paddingom), `grid-listings`, `eyebrow`,
`hero-shade` (tamni preliv preko hero fotografije), `row-scroll` (red kartica
koji na telefonu skroluje horizontalno, na desktopu je flex red), `img-fade`,
`scrollbar-thin`, `scrollbar-hide`. Forme: `.field-label`, `.field-control`,
`.field-control-error`. Kartica: `.card`.

## Komponente (`src/features/shared/components/ui/`)

Button (pill, 5 varijanti), Badge, Checkbox (nativni input, radi u server
formama), Toggle, Select (custom, tastatura, searchable, hidden input za
FormData), SelectField, Field/TextareaField/SubmitButton, Modal (portal,
framer-motion), Pagination, Breadcrumbs, SectionHeader, Skeleton, Logo.

Nova dijeljena komponenta: prvo provjeri `ksport-new/features/shared/components/ui/`
— ako postoji, kopiraj i skini `useT()`/brend; ako ne, piši po istom obrascu
(default export, props interface, `cn()`).

## Pravila

- Zaobljenja: `rounded-xl` polja i male kartice, `rounded-2xl` velike kartice,
  `rounded-full` dugmad i badge-evi na kartici slike.
- Tipografija: Manrope (`next/font/google`, težine 400–800). Naslovi
  `font-extrabold tracking-tight`; hero `text-hero leading-hero`, na desktopu
  `text-6xl`. Cijena na kartici je najistaknutiji tekst posle naslova.
- Naslovna: hero je fotografija (`public/images/hero.jpg`) + `hero-shade`,
  naslov i podnaslov lijevo, bijela kartica pretrage, ispod nje „često traženo“
  linkovi i broj vozila/placeva. Zatim: karoserije sa slikom pravog oglasa
  (`getBodyTypeStats`), najnoviji oglasi, placevi, CTA za placeve sa slikom.
- Kartica oglasa (`ListingCard`): slika 4:3, badge „Novo“ (tamna pločica,
  `rounded-md`), naslov = marka model, ispod varijanta u `muted`, jedan red
  specifikacija, cijena `text-lg font-extrabold` (+ „po dogovoru“ sitno),
  linija i plac · grad na dnu. `ring-1 ring-border` umjesto `border`.
- Kartica placa (`DealerCard`): tri slike najnovijih oglasa tog placa
  (`previews` iz `getDealers`), ispod logo (ili monogram), ime, grad · broj oglasa.
- Fotografije: slike oglasa su uvijek `next/image` sa `sizes`; hero `priority`.
  Demo fotografije su sa Pexelsa (`db/demo/photos.json`, licenca dozvoljava
  komercijalnu upotrebu bez atribucije), keš u `storage/demo-cache`.
- Forme: labela iznad polja, greška crvenim ispod, obavezna polja sa `*`.
  Custom Select za sve liste; nativni `<select>` se ne koristi.
- Stanja: svaki dinamični dio ima Suspense fallback istih dimenzija
  (`Skeleton`), prazna stanja sa jasnom akcijom, greške u tekstu a ne alertu.
- Pristupačnost: fokus vidljiv (`focus-visible:ring`), ikone `aria-hidden`,
  dugmad samo sa ikonom imaju `aria-label`, kontrast iz tokena.
- Bez arbitrary vrijednosti u JSX-u; bez `zinc`/`blue`/`gray` klasa — tokeni.
- Animacije: `framer-motion` samo iz `src/lib/motion/variants.ts`, kratke
  (≤ 250ms), bez animacija na listama dužim od 20 stavki.

## Logo

`src/features/shared/components/ui/Logo.tsx` (inline SVG, boje iz tokena),
`public/logo.svg` (za email/OG), `src/app/icon.svg` (favicon). Znak: tamna
pločica, bijela silueta auta, plava traka puta. Wordmark: naziv malim slovima
sa plavom tačkom. Kad ime postane konačno, mijenja se samo `SITE.name` i
wordmark u `public/logo.svg`.
