"use client";

import { useActionState, useMemo, useState } from "react";
import { Field, TextareaField, SubmitButton, FieldWrap } from "@/features/shared/components/ui/Field";
import SelectField from "@/features/shared/components/ui/SelectField";
import Checkbox from "@/features/shared/components/ui/Checkbox";
import ImageUploader, { type UploadedImage } from "@/features/dealer-panel/components/ImageUploader";
import { FUEL, TRANSMISSION, BODY, DRIVE, CONDITION, FEATURE_GROUP } from "@/features/listings/lib/labels";
import type { Catalog } from "@/lib/catalog";
import type { Listing } from "@/db/schema";
import type { FormState } from "@/features/dealer-panel/actions";

interface Props {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  catalog: Catalog;
  listing?: Listing | null;
  images?: UploadedImage[];
  featureIds?: number[];
}

const toOptions = (map: Record<string, string>) => Object.entries(map).map(([value, label]) => ({ value, label }));
const FUEL_OPTS = toOptions(FUEL);
const TRANSMISSION_OPTS = toOptions(TRANSMISSION);
const BODY_OPTS = toOptions(BODY);
const DRIVE_OPTS = toOptions(DRIVE);
const CONDITION_OPTS = toOptions(CONDITION);
const CURRENT_YEAR = new Date().getFullYear(); // module scope, ne u renderu
const YEAR_OPTS = Array.from({ length: CURRENT_YEAR + 1 - 1969 }, (_, i) => String(CURRENT_YEAR + 1 - i)).map((y) => ({
  value: y,
  label: y,
}));

const str = (v: string | number | null | undefined) => (v == null ? "" : String(v));

export default function ListingForm({ action, catalog, listing, images = [], featureIds = [] }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const e = state?.errors ?? {};
  const [makeId, setMakeId] = useState(str(listing?.makeId));
  const [modelId, setModelId] = useState(str(listing?.modelId));
  const [onRequest, setOnRequest] = useState(listing?.priceOnRequest ?? false);
  const [selected, setSelected] = useState<Set<number>>(() => new Set(featureIds));

  const makeOptions = useMemo(
    () => catalog.makes.map((m) => ({ value: String(m.id), label: m.name })),
    [catalog.makes],
  );
  const modelOptions = useMemo(
    () =>
      catalog.models.filter((m) => String(m.makeId) === makeId).map((m) => ({ value: String(m.id), label: m.name })),
    [catalog.models, makeId],
  );
  const cityOptions = useMemo(
    () => catalog.cities.map((c) => ({ value: String(c.id), label: c.name })),
    [catalog.cities],
  );
  const groups = useMemo(() => {
    const g = new Map<string, Catalog["features"]>();
    for (const f of catalog.features) g.set(f.group, [...(g.get(f.group) ?? []), f]);
    return g;
  }, [catalog.features]);

  function toggle(id: number) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <section className="container-box flex flex-col gap-5">
        <h2 className="text-lg font-bold">Vozilo</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            label="Marka"
            name="makeId"
            options={makeOptions}
            value={makeId}
            onChange={(v) => {
              setMakeId(v);
              setModelId("");
            }}
            placeholder="Izaberi marku"
            required
            searchable
            error={e.makeId}
          />
          <SelectField
            label="Model"
            name="modelId"
            options={modelOptions}
            value={modelId}
            onChange={setModelId}
            placeholder="Izaberi model"
            required
            searchable
            disabled={!makeId}
            error={e.modelId}
          />
          <Field
            label="Varijanta / motor"
            name="variant"
            defaultValue={listing?.variant ?? ""}
            placeholder="npr. 2.0 TDI Highline"
            error={e.variant}
          />
          <SelectField
            label="Godište"
            name="year"
            options={YEAR_OPTS}
            defaultValue={str(listing?.year)}
            required
            searchable
            error={e.year}
          />
          <Field
            label="Kilometraža"
            name="mileageKm"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={str(listing?.mileageKm)}
            required
            error={e.mileageKm}
          />
          <SelectField
            label="Stanje"
            name="condition"
            options={CONDITION_OPTS}
            defaultValue={listing?.condition ?? "used"}
            error={e.condition}
          />
          <SelectField
            label="Gorivo"
            name="fuel"
            options={FUEL_OPTS}
            defaultValue={listing?.fuel ?? ""}
            required
            error={e.fuel}
          />
          <SelectField
            label="Mjenjač"
            name="transmission"
            options={TRANSMISSION_OPTS}
            defaultValue={listing?.transmission ?? ""}
            required
            error={e.transmission}
          />
          <SelectField
            label="Karoserija"
            name="bodyType"
            options={BODY_OPTS}
            defaultValue={listing?.bodyType ?? ""}
            required
            error={e.bodyType}
          />
          <SelectField
            label="Pogon"
            name="drive"
            options={DRIVE_OPTS}
            defaultValue={listing?.drive ?? ""}
            placeholder="Nije navedeno"
            clearable
            error={e.drive}
          />
          <Field
            label="Kubikaža (cm³)"
            name="engineCc"
            type="number"
            inputMode="numeric"
            defaultValue={str(listing?.engineCc)}
            error={e.engineCc}
          />
          <Field
            label="Snaga (kW)"
            name="powerKw"
            type="number"
            inputMode="numeric"
            defaultValue={str(listing?.powerKw)}
            error={e.powerKw}
          />
          <Field
            label="Broj vrata"
            name="doors"
            type="number"
            min={2}
            max={6}
            defaultValue={str(listing?.doors)}
            error={e.doors}
          />
          <Field
            label="Broj sjedišta"
            name="seats"
            type="number"
            min={1}
            max={9}
            defaultValue={str(listing?.seats)}
            error={e.seats}
          />
          <Field label="Boja" name="color" defaultValue={listing?.color ?? ""} error={e.color} />
          <Field label="Broj šasije (VIN)" name="vin" maxLength={17} defaultValue={listing?.vin ?? ""} error={e.vin} />
          <Field
            label="Registrovan do"
            name="registeredUntil"
            type="date"
            defaultValue={listing?.registeredUntil ?? ""}
            error={e.registeredUntil}
          />
        </div>
        <div className="flex flex-wrap gap-6">
          <Checkbox name="customsCleared" label="Ocarinjen" defaultChecked={listing?.customsCleared ?? true} />
          <Checkbox name="isDamaged" label="Oštećen / udaren" defaultChecked={listing?.isDamaged ?? false} />
          <Checkbox name="firstOwner" label="Prvi vlasnik" defaultChecked={listing?.firstOwner ?? false} />
        </div>
      </section>

      <section className="container-box flex flex-col gap-5">
        <h2 className="text-lg font-bold">Cijena i lokacija</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Cijena (€)"
            name="priceEur"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={listing?.priceEur || ""}
            readOnly={onRequest}
            error={e.priceEur}
          />
          <SelectField
            label="Grad"
            name="cityId"
            options={cityOptions}
            defaultValue={str(listing?.cityId)}
            placeholder="Izaberi grad"
            required
            searchable
            error={e.cityId}
          />
        </div>
        <div className="flex flex-wrap gap-6">
          <Checkbox
            name="priceNegotiable"
            label="Cijena po dogovoru"
            defaultChecked={listing?.priceNegotiable ?? false}
          />
          <Checkbox
            name="priceOnRequest"
            label="Cijena na upit"
            checked={onRequest}
            onChange={(ev) => setOnRequest(ev.target.checked)}
          />
        </div>
      </section>

      <section className="container-box flex flex-col gap-5">
        <h2 className="text-lg font-bold">Oprema</h2>
        {[...groups.entries()].map(([group, items]) => (
          <div key={group}>
            <p className="eyebrow text-muted mb-3">{FEATURE_GROUP[group as keyof typeof FEATURE_GROUP] ?? group}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((f) => (
                <Checkbox
                  key={f.id}
                  name="features"
                  value={String(f.id)}
                  checked={selected.has(f.id)}
                  onChange={() => toggle(f.id)}
                  label={f.name}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="container-box flex flex-col gap-5">
        <h2 className="text-lg font-bold">Opis i slike</h2>
        <TextareaField
          label="Opis"
          name="description"
          defaultValue={listing?.description ?? ""}
          error={e.description}
        />
        <FieldWrap label="Slike" error={e.images}>
          <ImageUploader initial={images} />
        </FieldWrap>
      </section>

      {e.form && <p className="text-danger text-sm">{e.form}</p>}
      <div className="flex flex-wrap gap-3">
        <SubmitButton pending={pending} name="intent" value="publish">
          {listing?.status === "active" ? "Sačuvaj izmjene" : "Objavi oglas"}
        </SubmitButton>
        {listing?.status !== "active" && (
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={pending}
            className="border-border hover:border-foreground inline-flex h-11 items-center rounded-full border bg-white px-6 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Sačuvaj kao nacrt
          </button>
        )}
      </div>
    </form>
  );
}
