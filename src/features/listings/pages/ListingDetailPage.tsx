import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Store } from "lucide-react";
import { getListingByPublicId } from "@/features/listings/api/getListing";
import { FUEL, TRANSMISSION, BODY, DRIVE, CONDITION, FEATURE_GROUP, LISTING_STATUS } from "@/features/listings/lib/labels";
import Gallery from "@/features/listings/components/Gallery";
import ContactButtons from "@/features/listings/components/ContactButtons";
import Breadcrumbs from "@/features/shared/components/ui/Breadcrumbs";
import Badge from "@/features/shared/components/ui/Badge";
import Button from "@/features/shared/components/ui/Button";
import { formatDate, formatKm, formatPrice, kwToHp } from "@/lib/utils/format";

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
  ];
  const groups = new Map<string, string[]>();
  for (const f of l.featureList) groups.set(f.group, [...(groups.get(f.group) ?? []), f.name]);
  const sold = l.status !== "active";

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Automobili", href: "/automobili" }, { label: l.make.name, href: `/automobili?marka=${l.make.slug}` }, { label: l.model.name, href: `/automobili?marka=${l.make.slug}&model=${l.model.slug}` }]} />

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-8">
          <Gallery images={l.gallery} alt={`${l.title} ${l.year}`} />

          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold tracking-tight">Specifikacije</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
              {specs.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="border-b border-border pb-2"><dt className="text-xs text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
          </section>

          {groups.size > 0 && (
            <section className="card p-6">
              <h2 className="mb-4 text-lg font-bold tracking-tight">Oprema</h2>
              <div className="flex flex-col gap-4">
                {[...groups.entries()].map(([g, names]) => (
                  <div key={g}>
                    <p className="eyebrow mb-2 text-muted">{FEATURE_GROUP[g as keyof typeof FEATURE_GROUP] ?? g}</p>
                    <ul className="flex flex-wrap gap-2">{names.map((n) => <li key={n} className="rounded-full bg-neutral-100 px-3 py-1 text-sm">{n}</li>)}</ul>
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
              {l.customsCleared && <Badge variant="success">Ocarinjen</Badge>}
              {l.priceNegotiable && <Badge>Po dogovoru</Badge>}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{l.title}</h1>
            <p className="mt-1 text-sm text-muted">{l.year} · {formatKm(l.mileageKm)} · {FUEL[l.fuel]}</p>
            <p className="mt-4 text-3xl font-extrabold tracking-tight">{l.priceOnRequest ? <span className="text-xl font-semibold text-muted">Cijena na upit</span> : formatPrice(l.priceEur)}</p>
            <div className="mt-5">
              {sold ? <p className="text-sm text-muted">Ovaj oglas više nije aktivan.</p> : <ContactButtons listingId={l.id} phone={l.dealer.phone} viber={l.dealer.viber ?? l.dealer.phone} whatsapp={l.dealer.whatsapp} />}
            </div>
            <p className="mt-3 text-xs text-muted">Objavljeno {formatDate(l.publishedAt, undefined, "–")} · {l.viewsCount} pregleda</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                {l.dealer.logo ? <Image src={l.dealer.logo} alt="" width={48} height={48} className="h-full w-full object-cover" /> : <Store size={20} className="text-neutral-400" aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold"><Link href={`/placevi/${l.dealer.slug}`} className="hover:text-accent">{l.dealer.name}</Link></p>
                <p className="flex items-center gap-1 text-xs text-muted"><MapPin size={12} aria-hidden="true" />{l.dealer.address ? `${l.dealer.address}, ` : ""}{l.dealer.city.name}</p>
              </div>
            </div>
            <Button href={`/placevi/${l.dealer.slug}`} variant="outline" size="sm" fullWidth className="mt-4">Sva vozila ovog placa</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
