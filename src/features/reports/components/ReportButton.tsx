"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";
import Modal from "@/features/shared/components/ui/Modal";
import Button from "@/features/shared/components/ui/Button";
import SelectField from "@/features/shared/components/ui/SelectField";
import { TextareaField, SubmitButton } from "@/features/shared/components/ui/Field";
import { reportListing, type ReportState } from "@/features/reports/actions";
import { REPORT_REASON } from "@/features/reports/lib/labels";

const OPTIONS = Object.entries(REPORT_REASON).map(([value, label]) => ({ value, label }));

export default function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ReportState, FormData>(
    reportListing.bind(null, listingId),
    undefined,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-muted hover:text-foreground inline-flex items-center gap-1.5 text-xs"
      >
        <Flag size={13} aria-hidden="true" />
        <span>Prijavi oglas</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} label="Prijavi oglas" maxWidth="max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-bold tracking-tight">Prijavi oglas</h2>
          {state?.done ? (
            <div className="mt-4 flex flex-col gap-4">
              <p className="text-sm text-neutral-700">{state.message}</p>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Zatvori
              </Button>
            </div>
          ) : (
            <form action={formAction} className="mt-4 flex flex-col gap-4">
              <SelectField
                label="Razlog"
                name="reason"
                options={OPTIONS}
                placeholder="Izaberi razlog"
                required
                error={state?.errors?.reason}
              />
              <TextareaField
                label="Poruka"
                name="message"
                rows={3}
                hint="Nije obavezno. Ne upisuj lične podatke."
                error={state?.errors?.message}
              />
              {state?.message && <p className="text-danger text-sm">{state.message}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Odustani
                </Button>
                <SubmitButton pending={pending}>Pošalji prijavu</SubmitButton>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
}
