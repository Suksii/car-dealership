"use client";

import { useSearchParams } from "next/navigation";

/** Potvrda poslije klika na link iz emaila (/nalog?email=potvrdjen). */
export default function EmailConfirmedBanner() {
  if (useSearchParams().get("email") !== "potvrdjen") return null;
  return (
    <p role="status" className="bg-success/10 text-success rounded-2xl p-4 text-sm font-medium">
      Email je potvrđen. Hvala!
    </p>
  );
}
