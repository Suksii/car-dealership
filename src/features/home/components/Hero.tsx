import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getCatalog } from "@/lib/catalog";
import { getSiteStats } from "@/features/listings/api/getListings";
import SearchBox from "@/features/listings/components/SearchBox";
import { pluralSr } from "@/lib/utils/format";

const QUICK = [
  ["Golf", "/automobili?marka=volkswagen&model=golf"],
  ["Passat", "/automobili?marka=volkswagen&model=passat"],
  ["Octavia", "/automobili?marka=skoda&model=octavia"],
  ["Serija 3", "/automobili?marka=bmw&model=serija-3"],
  ["SUV do 20.000 €", "/automobili?karoserija=suv&cijena_do=20000"],
] as const;

async function Stats() {
  const s = await getSiteStats();
  return (
    <p className="text-sm text-white/70">
      <strong className="font-bold text-white">{s.listings}</strong>
      <span> {pluralSr(s.listings, ["vozilo", "vozila", "vozila"])} iz </span>
      <strong className="font-bold text-white">{s.dealers}</strong>
      <span> {pluralSr(s.dealers, ["autoplaca", "autoplaca", "autoplaceva"])} u </span>
      <strong className="font-bold text-white">{s.cities}</strong>
      <span> {pluralSr(s.cities, ["gradu", "grada", "gradova"])}</span>
    </p>
  );
}

export default async function Hero() {
  const { makes, models, cities } = await getCatalog();
  const slimModels = models.map(({ id, makeId, name, slug }) => ({ id, makeId, name, slug }));
  return (
    // Bez overflow-hidden: Select dropdown mora da izađe ispod sekcije; z-10 da bude iznad kartica (relative) niže na stranici.
    <section className="bg-foreground relative z-10 text-white">
      <Image
        src="/images/hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center md:object-right"
      />
      <div className="hero-shade absolute inset-0" aria-hidden="true" />
      <div className="container-page relative pt-14 pb-10 md:pt-24 md:pb-16">
        <h1 className="text-hero leading-hero max-w-2xl font-extrabold tracking-tight md:text-6xl">
          Auto sa placa, bez obilaska placeva.
        </h1>
        <p className="mt-4 max-w-lg text-base text-white/75 md:text-lg">
          Ponuda registrovanih autoplaceva iz cijele Crne Gore na jednom mjestu. Nađi model, uporedi cijene i pozovi
          plac direktno.
        </p>
        <div className="text-foreground mt-8">
          <SearchBox makes={makes} models={slimModels} cities={cities} />
        </div>
        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-sm text-white/70">
            <li className="mr-1">Često traženo:</li>
            {QUICK.map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="rounded-full border border-white/20 px-3 py-1 text-white/90 transition-colors hover:border-white hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Suspense fallback={<span className="h-5" />}>
            <Stats />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
