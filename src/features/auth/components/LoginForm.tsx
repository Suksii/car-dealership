"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, loginWithGoogle, type FormState } from "@/features/auth/actions";
import { Field, SubmitButton } from "@/features/shared/components/ui/Field";

export default function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, undefined);
  const next = useSearchParams().get("next") ?? "/nalog";

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        <Field label="Email" name="email" type="email" autoComplete="email" required error={state?.errors?.email} />
        <Field
          label="Lozinka"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={state?.errors?.password}
        />
        {state?.message && <p className="text-danger text-sm">{state.message}</p>}
        <SubmitButton pending={pending}>Prijavi se</SubmitButton>
      </form>

      {googleEnabled && (
        <form action={loginWithGoogle}>
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="border-border hover:border-foreground h-11 w-full rounded-full border bg-white text-sm font-semibold transition-colors"
          >
            Nastavi sa Google nalogom
          </button>
        </form>
      )}

      <p className="text-muted text-sm">
        Nemaš nalog?{" "}
        <Link href="/registracija" className="text-accent font-medium hover:underline">
          Registruj se
        </Link>
      </p>
    </div>
  );
}
