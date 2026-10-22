"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword, type FormState } from "@/features/auth/actions";
import { Field, SubmitButton } from "@/features/shared/components/ui/Field";

export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPassword, undefined);
  const token = useSearchParams().get("token") ?? "";

  if (!token) {
    return (
      <p className="text-muted text-sm">
        <span>Link nije potpun. </span>
        <Link href="/zaboravljena-lozinka" className="text-accent font-semibold hover:underline">
          Zatraži novi link
        </Link>
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <Field
        label="Nova lozinka"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={state?.errors?.password}
      />
      <Field
        label="Ponovi lozinku"
        name="passwordConfirm"
        type="password"
        autoComplete="new-password"
        required
        error={state?.errors?.passwordConfirm}
      />
      {state?.message && (
        <p className="text-danger text-sm">
          <span>{state.message} </span>
          <Link href="/zaboravljena-lozinka" className="font-semibold underline">
            Novi link
          </Link>
        </p>
      )}
      <SubmitButton pending={pending} className="mt-1 w-full">
        Sačuvaj lozinku
      </SubmitButton>
    </form>
  );
}
