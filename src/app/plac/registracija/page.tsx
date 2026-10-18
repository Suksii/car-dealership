import type { Metadata } from "next";
import { Suspense } from "react";
import DealerRegisterPage from "@/features/dealer-panel/pages/DealerRegisterPage";

export const metadata: Metadata = { title: "Registracija autoplaca" };

export default function Page() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Registruj svoj autoplac</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Besplatno. Nakon registracije možeš odmah unositi vozila, a oglasi postaju javni kad odobrimo plac.</p>
      <Suspense fallback={<p className="text-muted">Učitavanje…</p>}><DealerRegisterPage /></Suspense>
    </div>
  );
}
