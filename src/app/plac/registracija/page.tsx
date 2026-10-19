import type { Metadata } from "next";
import { Suspense } from "react";
import { FormSkeleton } from "@/features/shared/components/ui/PageSkeletons";
import DealerRegisterPage from "@/features/dealer-panel/pages/DealerRegisterPage";

export const metadata: Metadata = { title: "Registracija autoplaca" };

export default function Page() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Registruj svoj autoplac</h1>
      <p className="text-muted mt-1 mb-6 text-sm">
        Besplatno. Nakon registracije možeš odmah unositi vozila, a oglasi postaju javni kad odobrimo plac.
      </p>
      <Suspense fallback={<FormSkeleton fields={9} />}>
        <DealerRegisterPage />
      </Suspense>
    </div>
  );
}
