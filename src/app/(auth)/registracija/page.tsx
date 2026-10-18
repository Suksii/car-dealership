import type { Metadata } from "next";
import RegisterForm from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = { title: "Registracija" };

export default function Page() {
  return (
    <div className="container-narrow py-12">
      <div className="container-box mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Registracija</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
