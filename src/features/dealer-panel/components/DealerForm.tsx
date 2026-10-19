"use client";

import { useActionState } from "react";
import { Field, TextareaField, SubmitButton, FieldWrap } from "@/features/shared/components/ui/Field";
import Checkbox from "@/features/shared/components/ui/Checkbox";
import SelectField from "@/features/shared/components/ui/SelectField";
import ImageUploader, { type UploadedImage } from "@/features/dealer-panel/components/ImageUploader";
import type { FormState } from "@/features/dealer-panel/actions";
import type { Dealer } from "@/db/schema";
import { DAYS } from "@/features/dealers/lib/hours";

type City = { id: number; name: string };

interface Props {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  cities: City[];
  dealer?: Dealer | null;
  logo?: UploadedImage | null;
  cover?: UploadedImage | null;
  submitLabel: string;
}

export default function DealerForm({ action, cities, dealer, logo, cover, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const e = state?.errors ?? {};
  const cityOptions = cities.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <form action={formAction} className="container-box flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Naziv autoplaca"
          name="name"
          defaultValue={dealer?.name}
          required
          error={e.name}
          className="sm:col-span-2"
        />
        <SelectField
          label="Grad"
          name="cityId"
          options={cityOptions}
          defaultValue={dealer ? String(dealer.cityId) : ""}
          placeholder="Izaberi grad"
          required
          searchable
          error={e.cityId}
        />
        <Field label="Adresa" name="address" defaultValue={dealer?.address ?? ""} error={e.address} />
        <Field label="Telefon" name="phone" type="tel" defaultValue={dealer?.phone} required error={e.phone} />
        <Field label="Drugi telefon" name="phone2" type="tel" defaultValue={dealer?.phone2 ?? ""} error={e.phone2} />
        <Checkbox
          name="viberSame"
          value="1"
          defaultChecked={!dealer || dealer.viber === dealer.phone}
          label="Telefon je i na Viberu"
          className="sm:col-span-2"
        />
        <Field
          label="Drugi Viber broj"
          name="viber"
          type="tel"
          defaultValue={dealer && dealer.viber !== dealer.phone ? (dealer.viber ?? "") : ""}
          hint="Samo ako je Viber na drugom broju"
          error={e.viber}
        />
        <Field
          label="WhatsApp broj"
          name="whatsapp"
          type="tel"
          defaultValue={dealer?.whatsapp ?? ""}
          error={e.whatsapp}
        />
        <Field label="Email" name="email" type="email" defaultValue={dealer?.email ?? ""} error={e.email} />
        <Field label="Web sajt" name="website" defaultValue={dealer?.website ?? ""} error={e.website} />
      </div>
      <TextareaField
        label="O placu"
        name="description"
        defaultValue={dealer?.description ?? ""}
        hint="Kratak opis: šta nudite, kredit, zamjena, uvoz"
        error={e.description}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrap label="Logo" hint="Kvadrat, npr. 400×400">
          <ImageUploader name="logo" folder="dealers" single initial={logo ? [logo] : []} />
        </FieldWrap>
        <FieldWrap label="Naslovna fotografija" hint="Široka slika placa, ide na vrh stranice (npr. 1600×500)">
          <ImageUploader name="cover" folder="dealers" single initial={cover ? [cover] : []} />
        </FieldWrap>
      </div>
      <fieldset>
        <legend className="field-label">Radno vrijeme</legend>
        <p className="text-muted mt-1 mb-3 text-xs">
          Npr. „08:00–20:00“. Prazno = zatvoreno. Ako ne uneseš ništa, radno vrijeme se ne prikazuje.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DAYS.map(([key, label]) => (
            <Field
              key={key}
              label={label}
              name={`hours_${key}`}
              defaultValue={dealer?.workingHours?.[key] ?? ""}
              placeholder="08:00–16:00"
            />
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="field-label">Lokacija na mapi</legend>
        <p className="text-muted mt-1 mb-3 text-xs">
          U Google mapama desni klik na plac → prva stavka su koordinate (npr. 42.44, 19.26). Prikazuje mapu na stranici
          placa.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Geografska širina (lat)"
            name="lat"
            inputMode="decimal"
            defaultValue={dealer?.lat ?? ""}
            error={e.lat}
          />
          <Field
            label="Geografska dužina (lng)"
            name="lng"
            inputMode="decimal"
            defaultValue={dealer?.lng ?? ""}
            error={e.lng}
          />
        </div>
      </fieldset>
      {state?.message && (
        <p role="status" className="text-success text-sm">
          {state.message}
        </p>
      )}
      <div>
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
