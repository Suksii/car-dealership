"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register, type FormState } from "../actions";
import { Field, SubmitButton } from "@/components/form";

export function RegisterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(register, undefined);
  const e = state?.errors ?? {};

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-4">
        <Field label="Ime i prezime" name="name" autoComplete="name" required error={e.name} />
        <Field label="Email" name="email" type="email" autoComplete="email" required error={e.email} />
        <Field label="Telefon" name="phone" type="tel" autoComplete="tel" placeholder="067 123 456" required error={e.phone} />
        <Field label="Lozinka" name="password" type="password" autoComplete="new-password" required error={e.password} />
        <Field label="Ponovi lozinku" name="passwordConfirm" type="password" autoComplete="new-password" required error={e.passwordConfirm} />
        <SubmitButton pending={pending}>Napravi nalog</SubmitButton>
      </form>
      <p className="text-sm text-zinc-600">
        Već imaš nalog? <Link href="/prijava" className="text-blue-600 hover:underline">Prijavi se</Link>
      </p>
    </div>
  );
}
