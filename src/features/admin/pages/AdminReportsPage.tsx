import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { getReportsForAdmin } from "@/features/admin/api/getAdminData";
import { removeListingByAdmin, setReportStatus } from "@/features/admin/actions";
import { REPORT_REASON, REPORT_STATUS } from "@/features/reports/lib/labels";
import { listingPath } from "@/features/listings/lib/listing";
import Badge from "@/features/shared/components/ui/Badge";
import Button from "@/features/shared/components/ui/Button";
import { formatDate } from "@/lib/utils/format";

export default async function AdminReportsPage() {
  await requireAdmin();
  const rows = await getReportsForAdmin();
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Prijave oglasa</h1>
      {rows.length === 0 ? (
        <p className="text-muted">Nema otvorenih prijava.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.id} className="card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <Link href={listingPath(r.listing.slug, r.listing.publicId)} className="hover:text-accent font-bold">
                    {r.listing.title}
                  </Link>
                  <Badge variant={r.status === "open" ? "warning" : "default"}>{REPORT_STATUS[r.status]}</Badge>
                  <Badge variant="outline">{REPORT_REASON[r.reason as keyof typeof REPORT_REASON] ?? r.reason}</Badge>
                </p>
                {r.message && <p className="mt-1 text-sm text-neutral-700">{r.message}</p>}
                <p className="text-muted mt-1 text-xs">{`${formatDate(r.createdAt)} · ${r.reporterEmail ?? "anonimno"} · plac: ${r.listing.dealerName}`}</p>
              </div>
              {r.status === "open" && (
                <div className="flex flex-wrap gap-2">
                  <form action={setReportStatus.bind(null, r.id, "resolved")}>
                    <Button type="submit" size="sm">
                      Riješeno
                    </Button>
                  </form>
                  <form action={setReportStatus.bind(null, r.id, "dismissed")}>
                    <Button type="submit" size="sm" variant="outline">
                      Odbaci
                    </Button>
                  </form>
                  {r.listing.status === "active" && (
                    <form action={removeListingByAdmin.bind(null, r.listing.id)}>
                      <Button type="submit" size="sm" variant="ghost" className="text-danger">
                        Skini oglas
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
