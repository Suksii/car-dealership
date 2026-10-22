import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/features/auth/components/AuthShell";
import ConfirmEmailForm from "@/features/auth/components/ConfirmEmailForm";
import { REGISTER_POINTS } from "@/features/auth/lib/copy";

export const metadata: Metadata = { title: "Potvrda emaila", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Potvrda emaila" subtitle="Još samo jedan klik i nalog je spreman." points={REGISTER_POINTS}>
      <Suspense>
        <ConfirmEmailForm />
      </Suspense>
    </AuthShell>
  );
}
