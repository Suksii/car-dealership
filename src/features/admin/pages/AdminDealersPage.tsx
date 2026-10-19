import Image from "next/image";
import Link from "next/link";
import { Store } from "lucide-react";
import { requireAdmin } from "@/lib/dal";
import { getAdminStats, getDealersForAdmin } from "@/features/admin/api/getAdminData";
import { setDealerFeatured, setDealerStatus } from "@/features/admin/actions";
import { DEALER_STATUS } from "@/features/listings/lib/labels";
import Badge from "@/features/shared/components/ui/Badge";
import Button from "@/features/shared/components/ui/Button";
import { formatDate, pluralSr } from "@/lib/utils/format";

const STATUS_VARIANT = { pending: "warning", active: "success", suspended: "danger" } as const;

export default async function AdminDealersPage() {
  await requireAdmin();
  const [stats, rows] = await Promise.all([getAdminStats(), getDealersForAdmin()]);

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Placevi</h1>
      <dl className="mt-4 mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          [stats.pendingDealers, "čeka odobrenje"],
          [stats.activeListings, "aktivnih oglasa"],
          [stats.contactClicks7d, "kontakata u 7 dana"],
          [stats.openReports, "otvorenih prijava"],
        ].map(([n, label]) => (
          <div key={label} className="card p-4">
            <dd className="text-2xl font-extrabold tracking-tight">{n}</dd>
            <dt className="text-muted text-xs">{label}</dt>
          </div>
        ))}
      </dl>

      {rows.length === 0 ? (
        <p className="text-muted">Još nema registrovanih placeva.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((d) => (
            <li key={d.id} className="card flex flex-wrap items-center gap-4 p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
                {d.logo ? (
                  <Image src={d.logo} alt="" width={48} height={48} className="h-full w-full object-cover" />
                ) : (
                  <Store size={18} className="text-neutral-400" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <Link href={`/placevi/${d.slug}`} className="hover:text-accent font-bold">
                    {d.name}
                  </Link>
                  <Badge variant={STATUS_VARIANT[d.status]}>{DEALER_STATUS[d.status]}</Badge>
                  {d.isFeatured && <Badge variant="accent">Istaknut</Badge>}
                </p>
                <p className="text-muted mt-0.5 truncate text-xs">
                  {`${d.city} · ${d.phone} · ${d.ownerName ?? ""} (${d.ownerEmail}) · ${d.activeListings} ${pluralSr(d.activeListings, ["oglas", "oglasa", "oglasa"])} · ${formatDate(d.createdAt)}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {d.status !== "active" && (
                  <form action={setDealerStatus.bind(null, d.id, "active")}>
                    <Button type="submit" size="sm">
                      Odobri
                    </Button>
                  </form>
                )}
                {d.status === "active" && (
                  <form action={setDealerStatus.bind(null, d.id, "suspended")}>
                    <Button type="submit" size="sm" variant="outline" className="text-danger">
                      Suspenduj
                    </Button>
                  </form>
                )}
                <form action={setDealerFeatured.bind(null, d.id, !d.isFeatured)}>
                  <Button type="submit" size="sm" variant="ghost">
                    {d.isFeatured ? "Skini isticanje" : "Istakni"}
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
