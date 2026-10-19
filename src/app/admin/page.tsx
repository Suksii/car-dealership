import type { Metadata } from "next";
import { Suspense } from "react";
import AdminDealersPage from "@/features/admin/pages/AdminDealersPage";
import { RowListSkeleton } from "@/features/shared/components/ui/PageSkeletons";

export const metadata: Metadata = { title: "Admin – placevi", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<RowListSkeleton />}>
      <AdminDealersPage />
    </Suspense>
  );
}
