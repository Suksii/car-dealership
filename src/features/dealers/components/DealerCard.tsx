import Image from "next/image";
import Link from "next/link";
import { MapPin, Store } from "lucide-react";
import { pluralSr } from "@/lib/utils/format";
import type { DealerCardItem } from "@/features/dealers/api/getDealers";

export default function DealerCard({ dealer }: { dealer: DealerCardItem }) {
  return (
    <article className="card group relative flex items-center gap-4 p-4 transition-shadow hover:shadow-custom">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
        {dealer.logo
          ? <Image src={dealer.logo} alt="" width={56} height={56} className="h-full w-full object-cover" />
          : <Store size={22} className="text-neutral-400" aria-hidden="true" />}
      </div>
      <div className="min-w-0">
        <h3 className="truncate font-bold tracking-tight">
          <Link href={`/placevi/${dealer.slug}`} className="after:absolute after:inset-0">{dealer.name}</Link>
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
          <MapPin size={12} aria-hidden="true" /><span>{dealer.city}</span>
          <span aria-hidden="true">·</span>
          <span>{dealer.activeListings} {pluralSr(dealer.activeListings, ["oglas", "oglasa", "oglasa"])}</span>
        </p>
      </div>
    </article>
  );
}
