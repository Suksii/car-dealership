import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { requireDealer } from "@/lib/dal";
import { imageUrl } from "@/lib/images";
import { formatPrice, formatKm } from "@/lib/utils";
import { listingTitle, listingPath } from "@/lib/listings";
import { DEALER_STATUS, LISTING_STATUS } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setListingStatus } from "./actions";

export const metadata: Metadata = { title: "Moj autoplac" };

const statusVariant = { draft: "default", active: "success", sold: "accent", expired: "warning", removed: "danger" } as const;

async function Content() {
  const dealer = await requireDealer();
  const rows = await db.query.listings.findMany({
    where: eq(listings.dealerId, dealer.id),
    orderBy: desc(listings.createdAt),
    with: { make: true, model: true, images: { limit: 1, orderBy: (img, { asc }) => asc(img.sortOrder) } },
  });
  const visible = rows.filter((r) => r.status !== "removed");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{dealer.name}</h1>
          <p className="mt-1 text-sm text-muted">
            Status placa: <Badge variant={dealer.status === "active" ? "success" : dealer.status === "pending" ? "warning" : "danger"}>{DEALER_STATUS[dealer.status]}</Badge>
            {dealer.status === "pending" && <span className="ml-2">Oglasi postaju javni kad odobrimo plac.</span>}
          </p>
        </div>
        <Button href="/plac/oglasi/novi">Novi oglas</Button>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white p-10 text-center text-sm text-muted">
          Još nemaš oglasa. <Link href="/plac/oglasi/novi" className="text-accent hover:underline">Dodaj prvo vozilo</Link>.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-white p-3">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-surface">
                {l.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl(l.images[0].storageKey, "thumb")} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{listingTitle(l.make.name, l.model.name, l.variant)} <span className="text-muted">{l.year}</span></p>
                <p className="text-sm text-muted">{l.priceOnRequest ? "Cijena na upit" : formatPrice(l.priceEur)} · {formatKm(l.mileageKm)} · {l.viewsCount} pregleda</p>
              </div>
              <Badge variant={statusVariant[l.status]}>{LISTING_STATUS[l.status]}</Badge>
              <div className="flex items-center gap-1">
                <Button href={`/plac/oglasi/${l.id}`} variant="outline" size="sm">Uredi</Button>
                {l.status === "active" && (
                  <>
                    <Button href={listingPath(l.slug, l.publicId)} variant="ghost" size="sm">Pogledaj</Button>
                    <form action={setListingStatus.bind(null, l.id, "sold")}><Button type="submit" variant="ghost" size="sm">Prodato</Button></form>
                  </>
                )}
                {(l.status === "sold" || l.status === "expired") && (
                  <form action={setListingStatus.bind(null, l.id, "active")}><Button type="submit" variant="ghost" size="sm">Obnovi</Button></form>
                )}
                <form action={setListingStatus.bind(null, l.id, "removed")}><Button type="submit" variant="ghost" size="sm" className="text-danger">Obriši</Button></form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<p className="text-muted">Učitavanje...</p>}><Content /></Suspense>;
}
