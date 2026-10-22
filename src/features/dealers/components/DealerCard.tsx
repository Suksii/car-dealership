import Image from "next/image";
import Link from "next/link";
import { Store } from "lucide-react";
import { pluralSr } from "@/lib/utils/format";
import type { DealerCardItem } from "@/features/dealers/api/getDealers";
import VerifiedBadge from "@/features/dealers/components/VerifiedBadge";

/** Kartica placa: tri slike iz ponude + logo, ime, grad i broj oglasa. */
export default function DealerCard({ dealer }: { dealer: DealerCardItem }) {
  const previews = dealer.previews.slice(0, 3);
  const imgClass = "object-cover transition-transform duration-300 group-hover:scale-[1.04]";
  return (
    <article className="group bg-surface shadow-card ring-border hover:shadow-custom relative flex flex-col overflow-hidden rounded-2xl ring-1 transition-shadow">
      {/* Tri slike u nizu; sa manje od tri jedna slika preko cijele širine iste visine (bez praznih polja). */}
      {previews.length === 3 ? (
        <div className="grid grid-cols-3 gap-0.5 bg-neutral-100">
          {previews.map((src) => (
            <div key={src} className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
              <Image src={src} alt="" fill sizes="160px" className={imgClass} />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative flex aspect-[4/1] items-center justify-center overflow-hidden bg-neutral-100">
          {previews[0] ? (
            <Image src={previews[0]} alt="" fill sizes="(max-width: 768px) 100vw, 400px" className={imgClass} />
          ) : (
            <Store size={28} className="text-neutral-300" aria-hidden="true" />
          )}
        </div>
      )}
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
          {dealer.logo ? (
            <Image src={dealer.logo} alt="" width={44} height={44} className="h-full w-full object-cover" />
          ) : (
            <Store size={20} className="text-neutral-400" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 font-bold tracking-tight">
            <Link href={`/placevi/${dealer.slug}`} className="truncate after:absolute after:inset-0">
              {dealer.name}
            </Link>
            {dealer.verified && <VerifiedBadge compact />}
          </h3>
          <p className="text-muted mt-0.5 truncate text-xs">
            {`${dealer.city} · ${dealer.activeListings} ${pluralSr(dealer.activeListings, ["oglas", "oglasa", "oglasa"])}`}
          </p>
        </div>
      </div>
    </article>
  );
}
