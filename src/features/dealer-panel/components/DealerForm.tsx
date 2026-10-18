"use client";

import { useActionState } from "react";
import { Field, TextareaField, SubmitButton, FieldWrap } from "@/features/shared/components/ui/Field";
import SelectField from "@/features/shared/components/ui/SelectField";
import ImageUploader, { type UploadedImage } from "@/features/dealer-panel/components/ImageUploader";
import type { FormState } from "@/features/dealer-panel/actions";
import type { Dealer } from "@/db/schema";

type City = { id: number; name: string };

interface Props {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  cities: City[];
  dealer?: Dealer | null;
  logo?: UploadedImage | null;
  submitLabel: string;
}

export default function DealerForm({ action, cities, dealer, logo, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const e = state?.errors ?? {};
  const cityOptions = cities.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <form action={formAction} className="container-box flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Naziv autoplaca" name="name" defaultValue={dealer?.name} required error={e.name} className="sm:col-span-2" />
        <SelectField label="Grad" name="cityId" options={cityOptions} defaultValue={dealer ? String(dealer.cityId) : ""} placeholder="Izaberi grad" required searchable error={e.cityId} />
        <Field label="Adresa" name="address" defaultValue={dealer?.address ?? ""} error={e.address} />
        <Field label="Telefon" name="phone" type="tel" defaultValue={dealer?.phone} required error={e.phone} />
        <Field label="Drugi telefon" name="phone2" type="tel" defaultValue={dealer?.phone2 ?? ""} error={e.phone2} />
        <Field label="Viber broj" name="viber" type="tel" defaultValue={dealer?.viber ?? ""} hint="Ako je drugačiji od telefona" error={e.viber} />
        <Field label="WhatsApp broj" name="whatsapp" type="tel" defaultValue={dealer?.whatsapp ?? ""} error={e.whatsapp} />
        <Field label="Email" name="email" type="email" defaultValue={dealer?.email ?? ""} error={e.email} />
        <Field label="Web sajt" name="website" defaultValue={dealer?.website ?? ""} error={e.website} />
      </div>
      <TextareaField label="O placu" name="description" defaultValue={dealer?.description ?? ""} hint="Kratak opis, radno vrijeme, šta nudite" error={e.description} />
      <FieldWrap label="Logo">
        <ImageUploader name="logo" folder="dealers" single initial={logo ? [logo] : []} />
      </FieldWrap>
      {state?.message && <p className="text-sm text-success">{state.message}</p>}
      <div><SubmitButton pending={pending}>{submitLabel}</SubmitButton></div>
    </form>
  );
}
