import type { Metadata } from "next";
import { Suspense } from "react";
import DealerProfilePage from "@/features/dealer-panel/pages/DealerProfilePage";

export const metadata: Metadata = { title: "Profil placa" };

export default function Page() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Profil placa</h1>
      <Suspense fallback={<p className="text-muted">Učitavanje…</p>}><DealerProfilePage /></Suspense>
    </div>
  );
}
