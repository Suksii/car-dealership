import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Prijava" };

export default function PrijavaPage() {
  const googleEnabled = !!process.env.AUTH_GOOGLE_ID;
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Prijava</h1>
      <Suspense>
        <LoginForm googleEnabled={googleEnabled} />
      </Suspense>
    </div>
  );
}
