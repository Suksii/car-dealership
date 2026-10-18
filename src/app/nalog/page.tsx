import type { Metadata } from "next";
import { Suspense } from "react";
import AccountPage from "@/features/auth/pages/AccountPage";

export const metadata: Metadata = { title: "Moj nalog" };

export default function Page() {
  return (
    <div className="container-narrow py-12">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Moj nalog</h1>
      <Suspense fallback={<p className="text-muted">Učitavanje…</p>}>
        <AccountPage />
      </Suspense>
    </div>
  );
}
