"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, loginWithGoogle, type FormState } from "@/features/auth/actions";
import { Field, SubmitButton } from "@/features/shared/components/ui/Field";
import { GoogleIcon } from "@/features/shared/components/ui/BrandIcons";

export default function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, undefined);
  const next = useSearchParams().get("next") ?? "/nalog";

  return (
    <div className="flex flex-col gap-6">
      {googleEnabled && (
        <>
          <form action={loginWithGoogle}>
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="border-border flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border bg-white text-sm font-semibold transition-colors hover:border-neutral-400 hover:bg-neutral-50"
            >
              <GoogleIcon />
              <span>Nastavi sa Google nalogom</span>
            </button>
          </form>
          <div className="text-muted flex items-center gap-3 text-xs" aria-hidden="true">
            <span className="bg-border h-px flex-1" />
            <span>ili emailom</span>
            <span className="bg-border h-px flex-1" />
          </div>
        </>
      )}

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
        <SubmitButton pending={pending} className="mt-1 w-full">
          Prijavi se
        </SubmitButton>
      </form>

      <p className="text-muted border-border border-t pt-5 text-sm">
        <span>Nemaš nalog? </span>
        <Link href="/registracija" className="text-accent font-semibold hover:underline">
          Registruj se
        </Link>
      </p>
    </div>
  );
}
