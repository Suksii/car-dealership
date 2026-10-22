"use client";

import { useActionState } from "react";
import { MailWarning } from "lucide-react";
import { resendVerification, type FormState } from "@/features/auth/actions";
import { cn } from "@/lib/utils/cn";

interface Props {
  email: string;
  /** Dodatna rečenica, npr. zašto je potvrda potrebna na ovoj stranici. */
  reason?: string;
  className?: string;
}

/** Traka „Potvrdi email" sa dugmetom za novi link. */
export default function VerifyEmailNotice({ email, reason, className }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(resendVerification, undefined);
  return (
    <div
      className={cn("bg-warning/15 flex flex-col gap-3 rounded-2xl p-4 text-sm sm:flex-row sm:items-center", className)}
    >
      <MailWarning size={20} className="shrink-0 text-amber-700" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-semibold">Potvrdi email adresu</p>
        <p className="text-neutral-700">
          {state?.message ?? `Poslali smo link na ${email}. ${reason ?? "Provjeri inbox i spam."}`}
        </p>
      </div>
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="border-border h-9 shrink-0 rounded-xl border bg-white px-3.5 text-sm font-semibold transition-colors hover:border-neutral-400 disabled:opacity-50"
        >
          {pending ? "Šaljem…" : "Pošalji ponovo"}
        </button>
      </form>
    </div>
  );
}
