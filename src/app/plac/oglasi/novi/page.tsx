import type { Metadata } from "next";
import { Suspense } from "react";
import { requireDealer } from "@/lib/dal";
import { getCatalog } from "@/lib/catalog";
import { ListingForm } from "../listing-form";
import { saveListing } from "../../actions";

export const metadata: Metadata = { title: "Novi oglas" };

async function Content() {
  await requireDealer();
  const catalog = await getCatalog();
  return <ListingForm action={saveListing.bind(null, null)} catalog={catalog} />;
}

export default function Page() {
  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold">Novi oglas</h1>
      <Suspense fallback={<p className="text-muted">Učitavanje...</p>}><Content /></Suspense>
    </div>
  );
}
