import type { Metadata } from "next";
import { Suspense } from "react";
import AdminListingsPage from "@/features/admin/pages/AdminListingsPage";
import { RowListSkeleton } from "@/features/shared/components/ui/PageSkeletons";

export const metadata: Metadata = { title: "Admin – oglasi", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<RowListSkeleton rows={8} />}>
      <AdminListingsPage />
    </Suspense>
  );
}
