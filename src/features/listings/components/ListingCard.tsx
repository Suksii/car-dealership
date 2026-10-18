import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Fuel, Gauge, MapPin, Settings2 } from "lucide-react";
import { formatKm, formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { FUEL, TRANSMISSION } from "@/features/listings/lib/labels";
import type { ListingCardItem } from "@/features/listings/lib/card";

interface Props { item: ListingCardItem; priority?: boolean; className?: string }

export default function ListingCard({ item, priority = false, className }: Props) {
  return (
    <article className={cn("card group relative flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-custom", className)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {item.image ? (
          <Image src={item.image} alt={item.imageAlt} fill priority={priority} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">Bez slike</div>
        )}
        <div className="pointer-events-none absolute top-2.5 left-2.5 flex gap-1.5">
          {item.isNew && <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase">Novo</span>}
          {item.priceNegotiable && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-foreground">Po dogovoru</span>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-bold tracking-tight">
            <Link href={item.href} className="after:absolute after:inset-0">{item.title}</Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <MapPin size={12} aria-hidden="true" />
            <span>{item.dealer ? `${item.dealer.name} · ${item.city}` : item.city}</span>
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-neutral-600">
          <li className="flex items-center gap-1.5"><CalendarDays size={14} className="text-neutral-400" aria-hidden="true" />{item.year}</li>
          <li className="flex items-center gap-1.5"><Gauge size={14} className="text-neutral-400" aria-hidden="true" />{formatKm(item.mileageKm)}</li>
          <li className="flex items-center gap-1.5"><Fuel size={14} className="text-neutral-400" aria-hidden="true" />{FUEL[item.fuel]}</li>
          <li className="flex items-center gap-1.5"><Settings2 size={14} className="text-neutral-400" aria-hidden="true" />{TRANSMISSION[item.transmission]}</li>
        </ul>

        <p className="mt-auto pt-1 text-lg font-extrabold tracking-tight">
          {item.priceOnRequest ? <span className="text-base font-semibold text-muted">Cijena na upit</span> : formatPrice(item.priceEur)}
        </p>
      </div>
    </article>
  );
}
