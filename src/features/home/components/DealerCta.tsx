import Image from "next/image";
import { Check } from "lucide-react";
import Button from "@/features/shared/components/ui/Button";

const POINTS = [
  "Sopstvena stranica placa sa cijelom ponudom i kontaktom",
  "Neograničen broj oglasa, slike se obrađuju automatski",
  "Vidiš koliko ljudi je pozvalo ili pisalo za svako vozilo",
];

export default function DealerCta() {
  return (
    <div className="bg-surface shadow-card ring-border grid overflow-hidden rounded-3xl ring-1 md:grid-cols-2">
      <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[380px]">
        <Image
          src="/images/dealer-cta.jpg"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center p-6 md:p-12">
        <p className="text-accent text-sm font-semibold">Za autoplaceve</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
          Imaš autoplac? Stavi cijelu ponudu online za jedno popodne.
        </h2>
        <ul className="mt-5 flex flex-col gap-2.5 text-sm text-neutral-700">
          {POINTS.map((p) => (
            <li key={p} className="flex gap-2.5">
              <Check size={18} className="text-success mt-0.5 shrink-0" aria-hidden="true" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Button href="/plac/registracija" variant="secondary" size="lg">
            Registruj autoplac
          </Button>
          <span className="text-muted text-sm">Besplatno dok traje probni period.</span>
        </div>
      </div>
    </div>
  );
}
