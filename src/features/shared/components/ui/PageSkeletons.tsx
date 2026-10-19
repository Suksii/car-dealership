import Skeleton from "@/features/shared/components/ui/Skeleton";

/**
 * Fallback-ovi za Suspense na stranicama koje zavise od sesije (panel, nalog).
 * Dimenzije prate pravi sadržaj da nema skoka layout-a kad stigne.
 */

/** Forma: labela + polje u dvije kolone, textarea i dugme. */
export function FormSkeleton({ fields = 8, columns = 2 }: { fields?: number; columns?: 1 | 2 }) {
  return (
    <div className="container-box flex flex-col gap-6" aria-busy="true" aria-label="Učitavanje forme">
      <div className={columns === 2 ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"}>
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-11 w-40 rounded-xl" />
    </div>
  );
}

/** Lista redova sa sličicom (panel sa oglasima). */
export function RowListSkeleton({ rows = 5, header = true }: { rows?: number; header?: boolean }) {
  return (
    <div aria-busy="true" aria-label="Učitavanje liste">
      {header && (
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="card flex items-center gap-4 p-3">
            <Skeleton className="h-16 w-24 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-9 w-24 rounded-xl" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Lista „labela: vrijednost" (nalog). */
export function DetailsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div
      className="container-box grid grid-cols-[auto_1fr] gap-x-8 gap-y-4"
      aria-busy="true"
      aria-label="Učitavanje podataka"
    >
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="contents">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-48" />
        </div>
      ))}
    </div>
  );
}
