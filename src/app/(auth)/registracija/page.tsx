import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Registracija" };

export default function RegistracijaPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Registracija</h1>
      <RegisterForm />
    </div>
  );
}
