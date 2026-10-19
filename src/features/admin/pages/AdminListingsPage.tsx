import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { getListingsForAdmin } from "@/features/admin/api/getAdminData";
import { removeListingByAdmin } from "@/features/admin/actions";
import { LISTING_STATUS } from "@/features/listings/lib/labels";
import { listingPath } from "@/features/listings/lib/listing";
import Badge from "@/features/shared/components/ui/Badge";
import Button from "@/features/shared/components/ui/Button";
import { formatDate, formatPrice } from "@/lib/utils/format";

const STATUS_VARIANT = {
  draft: "default",
  active: "success",
  sold: "accent",
  expired: "warning",
  removed: "danger",
} as const;

export default async function AdminListingsPage() {
  await requireAdmin();
  const rows = await getListingsForAdmin();
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Oglasi</h1>
      {rows.length === 0 ? (
        <p className="text-muted">Nema oglasa.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((l) => (
            <li key={l.id} className="card flex flex-wrap items-center gap-4 p-3">
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {l.thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.thumb} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <Link
                    href={listingPath(l.slug, l.publicId)}
                    className="hover:text-accent font-bold"
                  >{`${l.title} ${l.year}`}</Link>
                  <Badge variant={STATUS_VARIANT[l.status]}>{LISTING_STATUS[l.status]}</Badge>
                  {l.dealer?.status !== "active" && <Badge variant="warning">Plac nije aktivan</Badge>}
                </p>
                <p className="text-muted mt-0.5 truncate text-xs">
                  {`${l.priceOnRequest ? "na upit" : formatPrice(l.priceEur)} · ${l.dealer?.name ?? "—"} · ${l.viewsCount} pregleda · ${formatDate(l.createdAt)}`}
                </p>
              </div>
              {l.status !== "removed" && (
                <form action={removeListingByAdmin.bind(null, l.id)}>
                  <Button type="submit" size="sm" variant="ghost" className="text-danger">
                    Skini sa sajta
                  </Button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
