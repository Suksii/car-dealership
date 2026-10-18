import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { requireDealer } from "@/lib/dal";
import { imageUrl } from "@/lib/images";
import { formatKm, formatPrice, pluralSr } from "@/lib/utils/format";
import { listingPath, listingTitle } from "@/features/listings/lib/listing";
import { DEALER_STATUS, LISTING_STATUS } from "@/features/listings/lib/labels";
import Badge from "@/features/shared/components/ui/Badge";
import Button from "@/features/shared/components/ui/Button";
import SectionHeader from "@/features/shared/components/ui/SectionHeader";
import { setListingStatus } from "@/features/dealer-panel/actions";

const STATUS_VARIANT = {
  draft: "default",
  active: "success",
  sold: "accent",
  expired: "warning",
  removed: "danger",
} as const;

export default async function DashboardPage() {
  const dealer = await requireDealer();
  const rows = await db.query.listings.findMany({
    where: eq(listings.dealerId, dealer.id),
    orderBy: desc(listings.createdAt),
    with: { make: true, model: true, images: { limit: 1, orderBy: (img, { asc }) => asc(img.sortOrder) } },
  });
  const visible = rows.filter((r) => r.status !== "removed");

  return (
    <>
      <SectionHeader
        as="h1"
        title={dealer.name}
        eyebrow="Moj autoplac"
        action={<Button href="/plac/oglasi/novi">Novi oglas</Button>}
        className="mb-2"
      />
      <p className="text-muted mb-6 flex flex-wrap items-center gap-2 text-sm">
        <span>Status placa:</span>
        <Badge variant={dealer.status === "active" ? "success" : dealer.status === "pending" ? "warning" : "danger"}>
          {DEALER_STATUS[dealer.status]}
        </Badge>
        {dealer.status === "pending" && <span>Oglasi postaju javni kad odobrimo plac.</span>}
        <span>
          · {visible.length} {pluralSr(visible.length, ["oglas", "oglasa", "oglasa"])}
        </span>
      </p>

      {visible.length === 0 ? (
        <div className="border-border bg-surface text-muted rounded-2xl border border-dashed p-12 text-center text-sm">
          Još nemaš oglasa.{" "}
          <Link href="/plac/oglasi/novi" className="text-accent font-medium hover:underline">
            Dodaj prvo vozilo
          </Link>
          .
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((l) => (
            <li key={l.id} className="card flex flex-wrap items-center gap-4 p-3">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {l.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl(l.images[0].storageKey, "thumb")} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {listingTitle(l.make.name, l.model.name, l.variant)}{" "}
                  <span className="text-muted font-normal">{l.year}</span>
                </p>
                <p className="text-muted text-sm">
                  {l.priceOnRequest ? "Cijena na upit" : formatPrice(l.priceEur)} · {formatKm(l.mileageKm)} ·{" "}
                  {l.viewsCount} pregleda
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[l.status]}>{LISTING_STATUS[l.status]}</Badge>
              <div className="flex items-center gap-1">
                <Button href={`/plac/oglasi/${l.id}`} variant="outline" size="sm">
                  Uredi
                </Button>
                {l.status === "active" && (
                  <>
                    <Button href={listingPath(l.slug, l.publicId)} variant="ghost" size="sm">
                      Pogledaj
                    </Button>
                    <form action={setListingStatus.bind(null, l.id, "sold")}>
                      <Button type="submit" variant="ghost" size="sm">
                        Prodato
                      </Button>
                    </form>
                  </>
                )}
                {(l.status === "sold" || l.status === "expired") && (
                  <form action={setListingStatus.bind(null, l.id, "active")}>
                    <Button type="submit" variant="ghost" size="sm">
                      Obnovi
                    </Button>
                  </form>
                )}
                <form action={setListingStatus.bind(null, l.id, "removed")}>
                  <Button type="submit" variant="ghost" size="sm" className="text-danger">
                    Obriši
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
