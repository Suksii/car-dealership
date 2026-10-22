import { getDealers } from "@/features/dealers/api/getDealers";
import DealersGrid from "@/features/dealers/components/DealersGrid";
import Breadcrumbs from "@/features/shared/components/ui/Breadcrumbs";
import { pluralSr } from "@/lib/utils/format";
import EmptyState from "@/features/shared/components/ui/EmptyState";

export default async function DealersPage() {
  const dealers = await getDealers();

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Autoplacevi" }]} />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Autoplacevi u Crnoj Gori</h1>
      <p className="text-muted mt-1 mb-8 text-sm">
        {dealers.length} {pluralSr(dealers.length, ["plac", "placa", "placeva"])} · izaberi grad i pogledaj cijelu
        ponudu
      </p>
      {dealers.length === 0 ? (
        <EmptyState>Još nema registrovanih placeva.</EmptyState>
      ) : (
        <DealersGrid dealers={dealers} />
      )}
    </div>
  );
}
