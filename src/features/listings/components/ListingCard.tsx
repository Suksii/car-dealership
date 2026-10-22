import Image from "next/image";
import Link from "next/link";
import { formatKm, formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { FUEL, TRANSMISSION } from "@/features/listings/lib/labels";
import type { ListingCardItem } from "@/features/listings/lib/card";
import FavoriteButton from "@/features/favorites/components/FavoriteButton";

interface Props {
  item: ListingCardItem;
  priority?: boolean;
  className?: string;
}

/**
 * Kartica oglasa. Na telefonu su dvije u redu, pa je kompaktna: bez varijante i mjenjača,
 * manji razmaci; od `sm` naviše puna. Svaki tekst je u svom elementu (Chrome Translate).
 */
export default function ListingCard({ item, priority = false, className }: Props) {
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
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="text-muted flex h-full items-center justify-center text-sm">Bez slike</div>
        )}
        {item.isNew && (
          <span className="bg-foreground/90 absolute top-2 left-2 rounded-md px-2 py-0.5 text-xs font-bold text-white sm:top-3 sm:left-3">
            Novo
          </span>
        )}
        <FavoriteButton
          listingId={item.id}
          className="absolute top-2 right-2 h-8 w-8 sm:top-3 sm:right-3 sm:h-9 sm:w-9"
        />
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="truncate text-sm leading-snug font-bold tracking-tight sm:text-[15px]">
          <Link href={item.href} className="after:absolute after:inset-0">
            {item.name}
          </Link>
        </h3>
        <p className="text-muted mt-0.5 hidden truncate text-sm sm:block">{item.variant ?? " "}</p>
        <p className="mt-1.5 truncate text-xs text-neutral-600 sm:mt-2.5 sm:text-sm">
          <span>{item.year}</span>
          <span> · </span>
          <span>{formatKm(item.mileageKm)}</span>
          <span> · </span>
          <span>{FUEL[item.fuel]}</span>
          <span className="hidden sm:inline"> · </span>
          <span className="hidden sm:inline">{TRANSMISSION[item.transmission]}</span>
        </p>

        <div className="mt-auto flex items-baseline gap-2 pt-2 sm:pt-3">
          {item.priceOnRequest ? (
            <span className="text-muted text-sm font-bold sm:text-base">Cijena na upit</span>
          ) : (
            <span
              className={cn(
                "text-base font-extrabold tracking-tight sm:text-lg",
                item.previousPriceEur && "text-success",
              )}
            >
              {formatPrice(item.priceEur)}
            </span>
          )}
          {item.previousPriceEur && !item.priceOnRequest && (
            <span className="text-muted text-xs line-through" title="Cijena prije sniženja">
              {formatPrice(item.previousPriceEur)}
            </span>
          )}
          {item.priceNegotiable && !item.priceOnRequest && (
            <span className="text-muted hidden text-xs sm:inline">po dogovoru</span>
          )}
        </div>
        <div className="border-border text-muted mt-2 flex items-center justify-between gap-2 border-t pt-2 text-xs sm:mt-3 sm:pt-3">
          <p className="truncate">
            {item.dealer && <span className="hidden sm:inline">{`${item.dealer.name} · `}</span>}
            <span>{item.city}</span>
          </p>
          {item.publishedAgo && <p className="shrink-0">{item.publishedAgo}</p>}
        </div>
      </div>
    </article>
  );
}
