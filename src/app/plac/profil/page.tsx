import type { Metadata } from "next";
import { Suspense } from "react";
import { requireDealer } from "@/lib/dal";
import { getCatalog } from "@/lib/catalog";
import { imageUrl } from "@/lib/images";
import { DealerForm } from "../dealer-form";
import { updateDealer } from "../actions";

export const metadata: Metadata = { title: "Profil placa" };

async function Content() {
  const dealer = await requireDealer();
  const { cities } = await getCatalog();
  const logo = dealer.logoKey ? { key: dealer.logoKey, url: imageUrl(dealer.logoKey, "card") } : null;
  return <DealerForm action={updateDealer} cities={cities} dealer={dealer} logo={logo} submitLabel="Sačuvaj" />;
}

export default function Page() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Profil placa</h1>
      <Suspense fallback={<p className="text-muted">Učitavanje...</p>}><Content /></Suspense>
    </div>
  );
}
