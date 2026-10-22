"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type FormState } from "@/features/auth/actions";
import { Field, SubmitButton } from "@/features/shared/components/ui/Field";

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordReset, undefined);
  return (
    <div className="flex flex-col gap-6">
      {state?.message ? (
        <p role="status" className="bg-success/10 text-success rounded-xl p-4 text-sm font-medium">
          {state.message}
        </p>
      ) : (
        <form action={action} className="flex flex-col gap-4">
          <Field label="Email" name="email" type="email" autoComplete="email" required error={state?.errors?.email} />
          <SubmitButton pending={pending} className="mt-1 w-full">
            Pošalji link
          </SubmitButton>
        </form>
      )}
      <p className="text-muted border-border border-t pt-5 text-sm">
        <span>Sjetio si se lozinke? </span>
        <Link href="/prijava" className="text-accent font-semibold hover:underline">
          Prijavi se
        </Link>
      </p>
    </div>
  );
}
