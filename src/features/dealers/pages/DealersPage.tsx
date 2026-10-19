import { getDealers } from "@/features/dealers/api/getDealers";
import DealerCard from "@/features/dealers/components/DealerCard";
import Breadcrumbs from "@/features/shared/components/ui/Breadcrumbs";
import { pluralSr } from "@/lib/utils/format";

export default async function DealersPage() {
  const dealers = await getDealers();
  const byCity = new Map<string, typeof dealers>();
  for (const d of dealers) byCity.set(d.city, [...(byCity.get(d.city) ?? []), d]);

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Autoplacevi" }]} />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Autoplacevi u Crnoj Gori</h1>
      <p className="text-muted mt-1 mb-8 text-sm">
        {dealers.length} {pluralSr(dealers.length, ["plac", "placa", "placeva"])} · izaberi grad i pogledaj cijelu
        ponudu
      </p>
      {dealers.length === 0 ? (
        <p className="text-muted">Još nema registrovanih placeva.</p>
      ) : (
        <div className="flex flex-col gap-10">
          {[...byCity.entries()].map(([city, list]) => (
            <section key={city}>
              <h2 className="mb-3 text-lg font-bold tracking-tight">{city}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((d) => (
                  <DealerCard key={d.id} dealer={d} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
