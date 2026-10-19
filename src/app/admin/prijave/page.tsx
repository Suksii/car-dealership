import type { Metadata } from "next";
import { Suspense } from "react";
import AdminReportsPage from "@/features/admin/pages/AdminReportsPage";
import { RowListSkeleton } from "@/features/shared/components/ui/PageSkeletons";

export const metadata: Metadata = { title: "Admin – prijave", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<RowListSkeleton rows={5} />}>
      <AdminReportsPage />
    </Suspense>
  );
}
