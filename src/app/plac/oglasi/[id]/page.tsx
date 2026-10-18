import type { Metadata } from "next";
import { Suspense } from "react";
import ListingEditPage from "@/features/dealer-panel/pages/ListingEditPage";

export const metadata: Metadata = { title: "Uredi oglas" };

export default function Page({ params }: PageProps<"/plac/oglasi/[id]">) {
  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Uredi oglas</h1>
      <Suspense fallback={<p className="text-muted">Učitavanje…</p>}><ListingEditPage params={params} /></Suspense>
    </div>
  );
}
