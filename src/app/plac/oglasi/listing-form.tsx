"use client";

import { useActionState, useMemo, useState } from "react";
import { Field, SelectField, TextareaField, SubmitButton } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploader, type UploadedImage } from "@/components/image-uploader";
import { FUEL, TRANSMISSION, BODY, DRIVE, CONDITION, FEATURE_GROUP } from "@/lib/labels";
import type { Catalog } from "@/lib/catalog";
import type { Listing } from "@/db/schema";
import type { FormState } from "../actions";

interface Props {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  catalog: Catalog;
  listing?: Listing | null;
  images?: UploadedImage[];
  featureIds?: number[];
}

function Options({ map }: { map: Record<string, string> }) {
  return <>{Object.entries(map).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</>;
}

export function ListingForm({ action, catalog, listing, images = [], featureIds = [] }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const e = state?.errors ?? {};
  const [makeId, setMakeId] = useState<string>(listing ? String(listing.makeId) : "");
  const [onRequest, setOnRequest] = useState(listing?.priceOnRequest ?? false);
  const [selected, setSelected] = useState<Set<number>>(new Set(featureIds));
  const models = useMemo(() => catalog.models.filter((m) => String(m.makeId) === makeId), [catalog.models, makeId]);
  const groups = useMemo(() => {
    const g = new Map<string, Catalog["features"]>();
    for (const f of catalog.features) g.set(f.group, [...(g.get(f.group) ?? []), f]);
    return g;
  }, [catalog.features]);
  const years = useMemo(() => { const y = new Date().getFullYear() + 1; return Array.from({ length: y - 1969 }, (_, i) => y - i); }, []);

  function toggle(id: number) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Vozilo</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField label="Marka" name="makeId" value={makeId} onChange={(ev) => setMakeId(ev.target.value)} required error={e.makeId}>
            <option value="">Izaberi marku</option>
            {catalog.makes.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </SelectField>
          <SelectField label="Model" name="modelId" defaultValue={listing?.modelId ?? ""} required disabled={!makeId} error={e.modelId}>
            <option value="">Izaberi model</option>
            {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </SelectField>
          <Field label="Varijanta / motor" name="variant" defaultValue={listing?.variant ?? ""} placeholder="npr. 2.0 TDI Highline" error={e.variant} />
          <SelectField label="Godište" name="year" defaultValue={listing?.year ?? ""} required error={e.year}>
            <option value="">Izaberi</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </SelectField>
          <Field label="Kilometraža" name="mileageKm" type="number" min={0} defaultValue={listing?.mileageKm ?? ""} required error={e.mileageKm} />
          <SelectField label="Stanje" name="condition" defaultValue={listing?.condition ?? "used"} error={e.condition}><Options map={CONDITION} /></SelectField>
          <SelectField label="Gorivo" name="fuel" defaultValue={listing?.fuel ?? ""} required error={e.fuel}><option value="">Izaberi</option><Options map={FUEL} /></SelectField>
          <SelectField label="Mjenjač" name="transmission" defaultValue={listing?.transmission ?? ""} required error={e.transmission}><option value="">Izaberi</option><Options map={TRANSMISSION} /></SelectField>
          <SelectField label="Karoserija" name="bodyType" defaultValue={listing?.bodyType ?? ""} required error={e.bodyType}><option value="">Izaberi</option><Options map={BODY} /></SelectField>
          <SelectField label="Pogon" name="drive" defaultValue={listing?.drive ?? ""} error={e.drive}><option value="">Nije navedeno</option><Options map={DRIVE} /></SelectField>
          <Field label="Kubikaža (cm³)" name="engineCc" type="number" defaultValue={listing?.engineCc ?? ""} error={e.engineCc} />
          <Field label="Snaga (kW)" name="powerKw" type="number" defaultValue={listing?.powerKw ?? ""} error={e.powerKw} />
          <Field label="Broj vrata" name="doors" type="number" min={2} max={6} defaultValue={listing?.doors ?? ""} error={e.doors} />
          <Field label="Broj sjedišta" name="seats" type="number" min={1} max={9} defaultValue={listing?.seats ?? ""} error={e.seats} />
          <Field label="Boja" name="color" defaultValue={listing?.color ?? ""} error={e.color} />
          <Field label="Broj šasije (VIN)" name="vin" maxLength={17} defaultValue={listing?.vin ?? ""} error={e.vin} />
          <Field label="Registrovan do" name="registeredUntil" type="date" defaultValue={listing?.registeredUntil ?? ""} error={e.registeredUntil} />
        </div>
        <div className="flex flex-wrap gap-6">
          <NativeCheck name="customsCleared" label="Ocarinjen" defaultChecked={listing?.customsCleared ?? true} />
          <NativeCheck name="isDamaged" label="Oštećen / udaren" defaultChecked={listing?.isDamaged ?? false} />
          <NativeCheck name="firstOwner" label="Prvi vlasnik" defaultChecked={listing?.firstOwner ?? false} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Cijena i lokacija</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Cijena (€)" name="priceEur" type="number" min={0} defaultValue={listing?.priceEur || ""} disabled={onRequest} error={e.priceEur} />
          <SelectField label="Grad" name="cityId" defaultValue={listing?.cityId ?? ""} required error={e.cityId}>
            <option value="">Izaberi grad</option>
            {catalog.cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectField>
        </div>
        <div className="flex flex-wrap gap-6">
          <NativeCheck name="priceNegotiable" label="Cijena po dogovoru" defaultChecked={listing?.priceNegotiable ?? false} />
          <NativeCheck name="priceOnRequest" label="Cijena na upit" defaultChecked={onRequest} onChange={(v) => setOnRequest(v)} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Oprema</h2>
        {[...groups.entries()].map(([group, items]) => (
          <div key={group}>
            <p className="mb-2 text-sm font-medium text-muted">{FEATURE_GROUP[group as keyof typeof FEATURE_GROUP] ?? group}</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((f) => <Checkbox key={f.id} name="features" value={String(f.id)} checked={selected.has(f.id)} onChange={() => toggle(f.id)} label={f.name} />)}
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Opis i slike</h2>
        <TextareaField label="Opis" name="description" defaultValue={listing?.description ?? ""} error={e.description} />
        <ImageUploader initial={images} />
        {e.images && <p className="text-xs text-danger">{e.images}</p>}
      </section>

      {e.form && <p className="text-sm text-danger">{e.form}</p>}
      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <SubmitButton pending={pending} name="intent" value="publish">{listing?.status === "active" ? "Sačuvaj izmjene" : "Objavi oglas"}</SubmitButton>
        {listing?.status !== "active" && (
          <button type="submit" name="intent" value="draft" disabled={pending} className="h-10 rounded-lg border border-border bg-white px-5 text-sm font-semibold hover:border-accent hover:text-accent disabled:opacity-60">
            Sačuvaj kao nacrt
          </button>
        )}
      </div>
    </form>
  );
}

function NativeCheck({ name, label, defaultChecked, onChange }: { name: string; label: string; defaultChecked: boolean; onChange?: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} onChange={(ev) => onChange?.(ev.target.checked)} className="h-4 w-4 accent-accent" />
      {label}
    </label>
  );
}
