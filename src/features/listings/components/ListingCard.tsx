import Image from "next/image";
import Link from "next/link";
import { formatKm, formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { FUEL, TRANSMISSION } from "@/features/listings/lib/labels";
import type { ListingCardItem } from "@/features/listings/lib/card";

interface Props {
  item: ListingCardItem;
  priority?: boolean;
  className?: string;
}

export default function ListingCard({ item, priority = false, className }: Props) {
  const specs = [item.year, formatKm(item.mileageKm), FUEL[item.fuel], TRANSMISSION[item.transmission]];
  return (
    <article
      className={cn(
        "group bg-surface shadow-card ring-border hover:shadow-custom relative flex flex-col overflow-hidden rounded-2xl ring-1 transition-shadow duration-200",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.imageAlt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="text-muted flex h-full items-center justify-center text-sm">Bez slike</div>
        )}
        {item.isNew && (
          <span className="bg-foreground/90 absolute top-3 left-3 rounded-md px-2 py-0.5 text-xs font-bold text-white">
            Novo
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] leading-snug font-bold tracking-tight">
          <Link href={item.href} className="after:absolute after:inset-0">
            {item.name}
          </Link>
        </h3>
        <p className="text-muted mt-0.5 truncate text-sm">{item.variant ?? " "}</p>
        <p className="mt-2.5 text-sm text-neutral-600">{specs.join(" · ")}</p>

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          {item.priceOnRequest ? (
            <span className="text-muted text-base font-bold">Cijena na upit</span>
          ) : (
            <span className="text-lg font-extrabold tracking-tight">{formatPrice(item.priceEur)}</span>
          )}
          {item.priceNegotiable && !item.priceOnRequest && <span className="text-muted text-xs">po dogovoru</span>}
        </div>
        <p className="border-border text-muted mt-3 truncate border-t pt-3 text-xs">
          {item.dealer ? `${item.dealer.name} · ${item.city}` : item.city}
        </p>
      </div>
    </article>
  );
}
