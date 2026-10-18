import type { Metadata } from "next";
import { Suspense } from "react";
import ListingNewPage from "@/features/dealer-panel/pages/ListingNewPage";

export const metadata: Metadata = { title: "Novi oglas" };

export default function Page() {
  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Novi oglas</h1>
      <Suspense fallback={<p className="text-muted">Učitavanje…</p>}><ListingNewPage /></Suspense>
    </div>
  );
}
