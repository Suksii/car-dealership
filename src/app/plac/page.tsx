import type { Metadata } from "next";
import { Suspense } from "react";
import { RowListSkeleton } from "@/features/shared/components/ui/PageSkeletons";
import DashboardPage from "@/features/dealer-panel/pages/DashboardPage";

export const metadata: Metadata = { title: "Moj autoplac" };

export default function Page() {
  return (
    <Suspense fallback={<RowListSkeleton />}>
      <DashboardPage />
    </Suspense>
  );
}
