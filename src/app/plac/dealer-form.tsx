"use client";

import { useActionState } from "react";
import { Field, SelectField, TextareaField, SubmitButton } from "@/components/ui/field";
import { ImageUploader, type UploadedImage } from "@/components/image-uploader";
import type { FormState } from "./actions";
import type { Dealer } from "@/db/schema";

type City = { id: number; name: string };

interface Props {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  cities: City[];
  dealer?: Dealer | null;
  logo?: UploadedImage | null;
  submitLabel: string;
}

export function DealerForm({ action, cities, dealer, logo, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const e = state?.errors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Naziv autoplaca" name="name" defaultValue={dealer?.name} required error={e.name} className="sm:col-span-2" />
        <SelectField label="Grad" name="cityId" defaultValue={dealer?.cityId ?? ""} required error={e.cityId}>
          <option value="">Izaberi grad</option>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </SelectField>
        <Field label="Adresa" name="address" defaultValue={dealer?.address ?? ""} error={e.address} />
        <Field label="Telefon" name="phone" type="tel" defaultValue={dealer?.phone} required error={e.phone} />
        <Field label="Drugi telefon" name="phone2" type="tel" defaultValue={dealer?.phone2 ?? ""} error={e.phone2} />
        <Field label="Viber broj" name="viber" type="tel" defaultValue={dealer?.viber ?? ""} hint="Ako je drugačiji od telefona" error={e.viber} />
        <Field label="WhatsApp broj" name="whatsapp" type="tel" defaultValue={dealer?.whatsapp ?? ""} error={e.whatsapp} />
        <Field label="Email" name="email" type="email" defaultValue={dealer?.email ?? ""} error={e.email} />
        <Field label="Web sajt" name="website" defaultValue={dealer?.website ?? ""} error={e.website} />
      </div>
      <TextareaField label="O placu" name="description" defaultValue={dealer?.description ?? ""} hint="Kratak opis, radno vrijeme, šta nudite" error={e.description} />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Logo</span>
        <ImageUploader name="logo" folder="dealers" single initial={logo ? [logo] : []} />
      </div>
      {state?.message && <p className="text-sm text-success">{state.message}</p>}
      <div><SubmitButton pending={pending}>{submitLabel}</SubmitButton></div>
    </form>
  );
}
