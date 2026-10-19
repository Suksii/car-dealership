"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register, type FormState } from "@/features/auth/actions";
import { Field, SubmitButton } from "@/features/shared/components/ui/Field";
import TermsCheckbox from "@/features/legal/components/TermsCheckbox";

export default function RegisterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(register, undefined);
  const e = state?.errors ?? {};

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-4">
        <Field label="Ime i prezime" name="name" autoComplete="name" required error={e.name} />
        <Field label="Email" name="email" type="email" autoComplete="email" required error={e.email} />
        <Field
          label="Telefon"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="067 123 456"
          required
          error={e.phone}
        />
        <Field
          label="Lozinka"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          error={e.password}
        />
        <Field
          label="Ponovi lozinku"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          error={e.passwordConfirm}
        />
        <TermsCheckbox error={e.terms} />
        <SubmitButton pending={pending}>Napravi nalog</SubmitButton>
      </form>
      <p className="text-muted text-sm">
        Već imaš nalog?{" "}
        <Link href="/prijava" className="text-accent font-medium hover:underline">
          Prijavi se
        </Link>
      </p>
    </div>
  );
}
