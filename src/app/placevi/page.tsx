import type { Metadata } from "next";
import { Suspense } from "react";
import DealersPage from "@/features/dealers/pages/DealersPage";
import Skeleton from "@/features/shared/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Autoplacevi u Crnoj Gori",
  description: "Lista autoplaceva po gradovima sa kompletnom ponudom polovnih vozila.",
  alternates: { canonical: "/placevi" },
};

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page py-8"><Skeleton className="mb-8 h-10 w-72" /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-22 rounded-2xl" />)}</div></div>}>
      <DealersPage />
    </Suspense>
  );
}
