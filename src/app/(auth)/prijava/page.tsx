import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/features/auth/components/AuthShell";
import LoginForm from "@/features/auth/components/LoginForm";
import { LOGIN_POINTS } from "@/features/auth/lib/copy";

export const metadata: Metadata = { title: "Prijava" };

export default function Page() {
  return (
    <AuthShell
      title="Prijava"
      subtitle="Uđi u svoj nalog da vidiš sačuvane oglase ili panel placa."
      points={LOGIN_POINTS}
    >
      <Suspense>
        <LoginForm googleEnabled={!!process.env.AUTH_GOOGLE_ID} />
      </Suspense>
    </AuthShell>
  );
}
