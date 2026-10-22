import type { Metadata } from "next";
import AuthShell from "@/features/auth/components/AuthShell";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import { LOGIN_POINTS } from "@/features/auth/lib/copy";

export const metadata: Metadata = { title: "Zaboravljena lozinka", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell
      title="Zaboravljena lozinka"
      subtitle="Upiši email naloga i poslaćemo ti link za novu lozinku."
      points={LOGIN_POINTS}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
