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
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
        <TermsCheckbox error={e.terms} />
        <SubmitButton pending={pending} className="mt-1 w-full">
          Napravi nalog
        </SubmitButton>
      </form>
      <div className="text-muted border-border flex flex-col gap-1.5 border-t pt-5 text-sm">
        <p>
          <span>Već imaš nalog? </span>
          <Link href="/prijava" className="text-accent font-semibold hover:underline">
            Prijavi se
          </Link>
        </p>
        <p>
          <span>Imaš autoplac? </span>
          <Link href="/plac/registracija" className="text-accent font-semibold hover:underline">
            Registruj plac
          </Link>
        </p>
      </div>
    </div>
  );
}
