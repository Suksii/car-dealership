import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/features/auth/components/AuthShell";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
import { LOGIN_POINTS } from "@/features/auth/lib/copy";

export const metadata: Metadata = { title: "Nova lozinka", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Nova lozinka" subtitle="Izaberi novu lozinku, bar 8 karaktera." points={LOGIN_POINTS}>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
