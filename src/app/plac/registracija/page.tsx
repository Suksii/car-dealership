import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getMyDealer } from "@/lib/dal";
import { getCatalog } from "@/lib/catalog";
import { DealerForm } from "../dealer-form";
import { createDealer } from "../actions";

export const metadata: Metadata = { title: "Registracija autoplaca" };

async function Content() {
  if (await getMyDealer()) redirect("/plac");
  const { cities } = await getCatalog();
  return <DealerForm action={createDealer} cities={cities} submitLabel="Registruj autoplac" />;
}

export default function Page() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Registruj svoj autoplac</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Besplatno. Nakon registracije možeš odmah unositi vozila, a oglasi postaju javni kad odobrimo plac.</p>
      <Suspense fallback={<p className="text-muted">Učitavanje...</p>}><Content /></Suspense>
    </div>
  );
}
