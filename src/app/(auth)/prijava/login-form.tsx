"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, loginWithGoogle, type FormState } from "../actions";
import { Field, SubmitButton } from "@/components/form";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, undefined);
  const next = useSearchParams().get("next") ?? "/nalog";

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        <Field label="Email" name="email" type="email" autoComplete="email" required error={state?.errors?.email} />
        <Field label="Lozinka" name="password" type="password" autoComplete="current-password" required error={state?.errors?.password} />
        {state?.message && <p className="text-sm text-red-600">{state.message}</p>}
        <SubmitButton pending={pending}>Prijavi se</SubmitButton>
      </form>

      {googleEnabled && (
        <form action={loginWithGoogle}>
          <input type="hidden" name="next" value={next} />
          <button type="submit" className="w-full rounded-md border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-50">
            Nastavi sa Google nalogom
          </button>
        </form>
      )}

      <p className="text-sm text-zinc-600">
        Nemaš nalog? <Link href="/registracija" className="text-blue-600 hover:underline">Registruj se</Link>
      </p>
    </div>
  );
}
