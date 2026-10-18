import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardPage from "@/features/dealer-panel/pages/DashboardPage";

export const metadata: Metadata = { title: "Moj autoplac" };

export default function Page() {
  return <Suspense fallback={<p className="text-muted">Učitavanje…</p>}><DashboardPage /></Suspense>;
}
