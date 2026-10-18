import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "Prijava" };

export default function Page() {
  const googleEnabled = !!process.env.AUTH_GOOGLE_ID;
  return (
    <div className="container-narrow py-12">
      <div className="container-box mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Prijava</h1>
        <Suspense>
          <LoginForm googleEnabled={googleEnabled} />
        </Suspense>
      </div>
    </div>
  );
}
