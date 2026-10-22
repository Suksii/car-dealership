"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { confirmEmail, type FormState } from "@/features/auth/actions";
import { SubmitButton } from "@/features/shared/components/ui/Field";

/** Potvrda je dugme, ne automatska pri otvaranju: skeneri emaila otvaraju linkove i potrošili bi token. */
export default function ConfirmEmailForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(confirmEmail, undefined);
  const token = useSearchParams().get("token") ?? "";

  if (!token) {
    return (
      <p className="text-muted text-sm">
        <span>Link nije potpun. </span>
        <Link href="/nalog" className="text-accent font-semibold hover:underline">
          Zatraži novi link na stranici naloga
        </Link>
      </p>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      {state?.message && <p className="text-danger text-sm">{state.message}</p>}
      <SubmitButton pending={pending} className="w-full">
        Potvrdi email
      </SubmitButton>
    </form>
  );
}
