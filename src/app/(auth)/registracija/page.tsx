import type { Metadata } from "next";
import AuthShell from "@/features/auth/components/AuthShell";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { REGISTER_POINTS } from "@/features/auth/lib/copy";

export const metadata: Metadata = { title: "Registracija" };

export default function Page() {
  return (
    <AuthShell title="Napravi nalog" subtitle="Besplatno, za manje od minute." points={REGISTER_POINTS}>
      <RegisterForm />
    </AuthShell>
  );
}
