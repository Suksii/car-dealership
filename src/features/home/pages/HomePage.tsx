import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Car, Store } from "lucide-react";
import { SITE } from "@/config/site";
import { getCatalog } from "@/lib/catalog";
import { getLatestListings, getSiteStats } from "@/features/listings/api/getListings";
import { getDealers } from "@/features/dealers/api/getDealers";
import SearchBox from "@/features/listings/components/SearchBox";
import ListingCard from "@/features/listings/components/ListingCard";
import { ListingGridSkeleton } from "@/features/listings/components/ListingCardSkeleton";
import DealerCard from "@/features/dealers/components/DealerCard";
import SectionHeader from "@/features/shared/components/ui/SectionHeader";
import Button from "@/features/shared/components/ui/Button";
import Skeleton from "@/features/shared/components/ui/Skeleton";

async function Hero() {
  const { makes, models, cities } = await getCatalog();
  const slimModels = models.map(({ id, makeId, name, slug }) => ({ id, makeId, name, slug }));
  return (
    <section className="hero-glow text-white">
      <div className="container-page pt-16 pb-24 md:pt-24 md:pb-32">
        <p className="eyebrow mb-4 text-white/60">Oglasnik autoplaceva · Crna Gora</p>
        <h1 className="max-w-3xl text-hero leading-hero font-extrabold tracking-tight md:text-6xl">
          Svi autoplacevi u Crnoj Gori <span className="text-accent-light">na jednom mjestu.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-white/70">{SITE.description}</p>
        <div className="mt-10 text-foreground">
          <SearchBox makes={makes} models={slimModels} cities={cities} />
        </div>
        <Suspense fallback={<div className="mt-6 h-5" />}><Stats /></Suspense>
      </div>
    </section>
  );
}

async function Stats() {
  const s = await getSiteStats();
  const items = [[s.listings, "vozila u ponudi"], [s.dealers, "autoplaceva"], [s.cities, "gradova"]] as const;
  return (
    <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/70">
      {items.map(([n, label]) => <li key={label}><span className="font-bold text-white">{n}</span> {label}</li>)}
    </ul>
  );
}

async function PopularMakes() {
  const { makes } = await getCatalog();
  const popular = makes.filter((m) => m.isPopular);
  return (
    <section className="container-page -mt-10">
      <ul className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        {popular.map((m) => (
          <li key={m.id} className="shrink-0">
            <Link href={`/automobili?marka=${m.slug}`} className="inline-flex h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium shadow-card transition-colors hover:border-foreground">
              {m.name}
            </Link>
          </li>
        ))}
        <li className="shrink-0">
          <Link href="/automobili" className="inline-flex h-10 items-center gap-1 rounded-full bg-foreground px-4 text-sm font-medium text-white">
            Sve marke <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </li>
      </ul>
    </section>
  );
}

async function LatestListings() {
  const items = await getLatestListings(8);
  if (items.length === 0) return <p className="text-muted">Još nema oglasa.</p>;
  return (
    <div className="grid-listings">
      {items.map((item, i) => <ListingCard key={item.id} item={item} priority={i < 4} />)}
    </div>
  );
}

async function Dealers() {
  const dealers = (await getDealers()).slice(0, 6);
  if (dealers.length === 0) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {dealers.map((d) => <DealerCard key={d.id} dealer={d} />)}
    </div>
  );
}

const PERKS = [
  { icon: Store, title: "Samo autoplacevi", text: "Vozila od registrovanih prodavaca, sa adresom i radnim vremenom. Bez anonimnih oglasa." },
  { icon: BadgeCheck, title: "Ocarinjeno i registrovano", text: "Na svakom oglasu jasno stoji carina, registracija i da li je auto bio udaran." },
  { icon: Car, title: "Pregled po placu", text: "Izaberi plac u svom gradu i vidi cijelu ponudu, pa ga posjeti sa spiskom u džepu." },
];

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div className="hero-glow h-[520px]" />}><Hero /></Suspense>
      <Suspense fallback={<div className="container-page -mt-10 h-10" />}><PopularMakes /></Suspense>

      <section className="container-page mt-16">
        <SectionHeader eyebrow="Svježe" title="Najnoviji oglasi" action={<Button href="/automobili" variant="outline" size="sm">Svi automobili</Button>} className="mb-6" />
        <Suspense fallback={<ListingGridSkeleton />}><LatestListings /></Suspense>
      </section>

      <section className="container-page mt-20">
        <div className="grid gap-4 md:grid-cols-3">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-light text-accent"><Icon size={22} aria-hidden="true" /></div>
              <h3 className="text-lg font-bold tracking-tight">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page mt-20">
        <SectionHeader eyebrow="Prodavci" title="Autoplacevi" action={<Button href="/placevi" variant="outline" size="sm">Svi placevi</Button>} className="mb-6" />
        <Suspense fallback={<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-22 rounded-2xl" />)}</div>}>
          <Dealers />
        </Suspense>
      </section>

      <section className="container-page mt-20">
        <div className="hero-glow flex flex-col items-start gap-6 rounded-3xl p-8 text-white md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <p className="eyebrow mb-2 text-white/60">Za autoplaceve</p>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Imaš autoplac? Objavi cijelu ponudu besplatno.</h2>
            <p className="mt-2 max-w-lg text-white/70">Sopstvena stranica placa, neograničen broj oglasa i statistika poziva. Bez naknade dok se ne dogovorimo drugačije.</p>
          </div>
          <Button href="/plac/registracija" size="lg" className="shrink-0">Registruj autoplac</Button>
        </div>
      </section>
    </>
  );
}
