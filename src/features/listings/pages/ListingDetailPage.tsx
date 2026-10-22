import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Store } from "lucide-react";
import { getListingByPublicId } from "@/features/listings/api/getListing";
import {
  FUEL,
  TRANSMISSION,
  BODY,
  DRIVE,
  CONDITION,
  FEATURE_GROUP,
  LISTING_STATUS,
  ORIGIN,
  EMISSION,
} from "@/features/listings/lib/labels";
import Gallery from "@/features/listings/components/Gallery";
import ContactButtons from "@/features/listings/components/ContactButtons";
import Breadcrumbs from "@/features/shared/components/ui/Breadcrumbs";
import Badge from "@/features/shared/components/ui/Badge";
import Button from "@/features/shared/components/ui/Button";
import { formatDate, formatKm, formatPrice, kwToHp } from "@/lib/utils/format";
import { SITE } from "@/config/site";
import { listingPath } from "@/features/listings/lib/listing";
import FavoriteButton from "@/features/favorites/components/FavoriteButton";
import ReportButton from "@/features/reports/components/ReportButton";
import PriceEstimate from "@/features/listings/components/PriceEstimate";
import ShareButtons from "@/features/listings/components/ShareButtons";
import VerifiedBadge from "@/features/dealers/components/VerifiedBadge";
import ListingCard from "@/features/listings/components/ListingCard";
import { getSimilarListings } from "@/features/listings/api/getSimilarListings";

export function publicIdFromSlug(slug: string) {
  return slug.slice(slug.lastIndexOf("-") + 1);
}

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = await getListingByPublicId(publicIdFromSlug(slug));
  if (!l) notFound();

  const specs: [string, string | null][] = [
    ["Godište", String(l.year)],
    ["Kilometraža", formatKm(l.mileageKm)],
    ["Gorivo", FUEL[l.fuel]],
    ["Mjenjač", TRANSMISSION[l.transmission]],
    ["Karoserija", BODY[l.bodyType]],
    ["Pogon", l.drive ? DRIVE[l.drive] : null],
    ["Kubikaža", l.engineCc ? `${l.engineCc} cm³` : null],
    ["Snaga", l.powerKw ? `${l.powerKw} kW (${kwToHp(l.powerKw)} KS)` : null],
    ["Vrata", l.doors ? String(l.doors) : null],
    ["Sjedišta", l.seats ? String(l.seats) : null],
    ["Boja", l.color],
    ["Stanje", CONDITION[l.condition]],
    ["Registrovan do", l.registeredUntil ? formatDate(l.registeredUntil) : null],
    ["Carina", l.customsCleared ? "Ocarinjen" : "Nije ocarinjen"],
    ["Udaran", l.isDamaged ? "Da" : "Ne"],
    ["Prvi vlasnik", l.firstOwner ? "Da" : null],
    ["Servisna knjiga", l.serviceBook ? "Da" : null],
    ["Emisiona klasa", l.emissionClass ? EMISSION[l.emissionClass] : null],
    [
      "Porijeklo",
      l.origin ? (l.origin === "imported" && l.importCountry ? `Uvoz (${l.importCountry})` : ORIGIN[l.origin]) : null,
    ],
    ["Garancija", l.warrantyMonths ? `${l.warrantyMonths} mj.` : null],
    ["Zamjena", l.tradeIn ? "Moguća" : null],
    ["Kredit / lizing", l.financing ? "Moguć" : null],
  ];
  const similar = await getSimilarListings({
    id: l.id,
    makeSlug: l.make.slug,
    modelSlug: l.model.slug,
    bodyType: l.bodyType,
    priceEur: l.priceEur,
    priceOnRequest: l.priceOnRequest,
  });
  const url = `${SITE.url}${listingPath(l.slug, l.publicId)}`;
  const groups = new Map<string, string[]>();
  for (const f of l.featureList) groups.set(f.group, [...(groups.get(f.group) ?? []), f.name]);
  const sold = l.status !== "active";

  // schema.org Car + Offer za Google (bogati rezultati za vozila). Samo javni podaci.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${l.title} ${l.year}`,
    brand: { "@type": "Brand", name: l.make.name },
    model: l.model.name,
    vehicleModelDate: String(l.year),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: l.mileageKm, unitCode: "KMT" },
    fuelType: FUEL[l.fuel],
    vehicleTransmission: TRANSMISSION[l.transmission],
    bodyType: BODY[l.bodyType],
    color: l.color ?? undefined,
    image: l.gallery.map((g) => g.full),
    url,
    offers: {
      "@type": "Offer",
      price: l.priceOnRequest ? undefined : l.priceEur,
      priceCurrency: "EUR",
      availability: sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      itemCondition: l.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
      seller: {
        "@type": "AutoDealer",
        name: l.dealer.name,
        telephone: l.dealer.phone,
        address: {
          "@type": "PostalAddress",
          addressLocality: l.dealer.city.name,
          streetAddress: l.dealer.address ?? undefined,
          addressCountry: "ME",
        },
      },
    },
  };

  return (
    <div className="container-page py-6 md:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Breadcrumbs
        items={[
          { label: "Automobili", href: "/automobili" },
          { label: l.make.name, href: `/automobili?marka=${l.make.slug}` },
          { label: l.model.name, href: `/automobili?marka=${l.make.slug}&model=${l.model.slug}` },
        ]}
      />

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-8">
          <div className="relative">
            <Gallery images={l.gallery} alt={`${l.title} ${l.year}`} />
            <FavoriteButton listingId={l.id} size={20} className="absolute top-3 right-3 h-11 w-11" />
          </div>

          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold tracking-tight">Specifikacije</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
              {specs
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="border-border border-b pb-2">
                    <dt className="text-muted text-xs">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
          </section>

          {groups.size > 0 && (
            <section className="card p-6">
              <h2 className="mb-4 text-lg font-bold tracking-tight">Oprema</h2>
              <div className="flex flex-col gap-4">
                {[...groups.entries()].map(([g, names]) => (
                  <div key={g}>
                    <p className="eyebrow text-muted mb-2">{FEATURE_GROUP[g as keyof typeof FEATURE_GROUP] ?? g}</p>
                    <ul className="flex flex-wrap gap-2">
                      {names.map((n) => (
                        <li key={n} className="rounded-full bg-neutral-100 px-3 py-1 text-sm">
                          {n}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {l.description && (
            <section className="card p-6">
              <h2 className="mb-3 text-lg font-bold tracking-tight">Opis</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-neutral-700">{l.description}</p>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:self-start">
          <div className="card p-6">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {sold && <Badge variant="dark">{LISTING_STATUS[l.status]}</Badge>}
              {l.priceDropped && !sold && <Badge variant="success">Cijena snižena</Badge>}
              {l.customsCleared && <Badge variant="success">Ocarinjen</Badge>}
              {l.warrantyMonths && <Badge variant="accent">{`Garancija ${l.warrantyMonths} mj.`}</Badge>}
              {l.tradeIn && <Badge>Zamjena</Badge>}
              {l.financing && <Badge>Kredit / lizing</Badge>}
              {l.priceNegotiable && <Badge>Po dogovoru</Badge>}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{l.title}</h1>
            <p className="text-muted mt-1 text-sm">
              {l.year} · {formatKm(l.mileageKm)} · {FUEL[l.fuel]}
            </p>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3">
              <p className="text-3xl font-extrabold tracking-tight">
                {l.priceOnRequest ? (
                  <span className="text-muted text-xl font-semibold">Cijena na upit</span>
                ) : (
                  formatPrice(l.priceEur)
                )}
              </p>
              {l.priceDropped && l.previousPriceEur && (
                <p className="text-muted text-sm line-through">{formatPrice(l.previousPriceEur)}</p>
              )}
            </div>
            {!l.priceOnRequest && !sold && (
              <PriceEstimate
                makeId={l.makeId}
                modelId={l.modelId}
                year={l.year}
                priceEur={l.priceEur}
                modelName={`${l.make.name} ${l.model.name}`}
              />
            )}
            <div className="mt-5">
              {sold ? (
                <p className="text-muted text-sm">Ovaj oglas više nije aktivan.</p>
              ) : (
                <ContactButtons
                  listingId={l.id}
                  phone={l.dealer.phone}
                  viber={l.dealer.viber ?? l.dealer.phone}
                  whatsapp={l.dealer.whatsapp}
                />
              )}
            </div>
            <div className="text-muted mt-3 flex items-center justify-between gap-3 text-xs">
              <p>
                {`Objavljeno ${formatDate(l.publishedAt, undefined, "–")}`}
                {l.publishedAgo && ` (${l.publishedAgo})`}
                {` · ${l.viewsCount} pregleda`}
              </p>
              <ReportButton listingId={l.id} />
            </div>
            <div className="border-border mt-4 border-t pt-4">
              <ShareButtons url={url} title={`${l.title} ${l.year}`} />
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                {l.dealer.logo ? (
                  <Image src={l.dealer.logo} alt="" width={48} height={48} className="h-full w-full object-cover" />
                ) : (
                  <Store size={20} className="text-neutral-400" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-bold">
                  <Link href={`/placevi/${l.dealer.slug}`} className="hover:text-accent truncate">
                    {l.dealer.name}
                  </Link>
                  {l.dealer.verifiedAt && <VerifiedBadge compact />}
                </p>
                <p className="text-muted flex items-center gap-1 text-xs">
                  <MapPin size={12} aria-hidden="true" />
                  {l.dealer.address ? `${l.dealer.address}, ` : ""}
                  {l.dealer.city.name}
                </p>
              </div>
            </div>
            <Button href={`/placevi/${l.dealer.slug}`} variant="outline" size="sm" fullWidth className="mt-4">
              Sva vozila ovog placa
            </Button>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-12 md:mt-16">
          <h2 className="mb-4 text-xl font-bold tracking-tight">Slični oglasi</h2>
          <div className="grid-listings">
            {similar.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
