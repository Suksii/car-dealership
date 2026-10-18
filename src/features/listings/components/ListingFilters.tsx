"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import Select from "@/features/shared/components/ui/Select";
import Button from "@/features/shared/components/ui/Button";
import { FieldWrap } from "@/features/shared/components/ui/Field";
import { FUEL, TRANSMISSION, BODY } from "@/features/listings/lib/labels";
import { filtersToQuery } from "@/features/listings/lib/filters";
import type { ListingFilters as Filters } from "@/features/listings/api/getListings";
import type { Catalog } from "@/lib/catalog";
import { cn } from "@/lib/utils/cn";

type Props = {
  filters: Filters;
  makes: Catalog["makes"];
  models: Pick<Catalog["models"][number], "id" | "makeId" | "name" | "slug">[];
  cities: Catalog["cities"];
  activeCount: number;
};

const toOpts = (m: Record<string, string>) => Object.entries(m).map(([value, label]) => ({ value, label }));
const FUEL_OPTS = toOpts(FUEL), TRANS_OPTS = toOpts(TRANSMISSION), BODY_OPTS = toOpts(BODY);
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => String(CURRENT_YEAR - i)).map((y) => ({ value: y, label: y }));
const PRICES = [2000, 3000, 5000, 8000, 10000, 15000, 20000, 30000, 50000, 80000].map((p) => ({ value: String(p), label: `${p.toLocaleString("sr-Latn-ME")} €` }));
const KMS = [50000, 100000, 150000, 200000, 250000, 300000].map((k) => ({ value: String(k), label: `do ${k.toLocaleString("sr-Latn-ME")} km` }));

export default function ListingFilters({ filters, makes, models, cities, activeCount }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Filters>(filters);

  const makeOpts = useMemo(() => makes.map((m) => ({ value: m.slug, label: m.name })), [makes]);
  const makeId = makes.find((m) => m.slug === f.make)?.id;
  const modelOpts = useMemo(() => models.filter((m) => m.makeId === makeId).map((m) => ({ value: m.slug, label: m.name })), [models, makeId]);
  const cityOpts = useMemo(() => cities.map((c) => ({ value: c.slug, label: c.name })), [cities]);

  const set = <K extends keyof Filters>(k: K) => (v: string) => setF((p) => ({ ...p, [k]: v === "" ? undefined : (typeof p[k] === "number" || ["priceMin", "priceMax", "yearMin", "yearMax", "kmMax"].includes(k) ? Number(v) : v), page: 1, ...(k === "make" ? { model: undefined } : {}) }));
  const s = (v: number | string | undefined) => (v === undefined ? "" : String(v));

  function apply() {
    const q = filtersToQuery({ ...f, page: 1 });
    startTransition(() => { router.push(`/automobili${q ? `?${q}` : ""}`); setOpen(false); });
  }
  function reset() {
    setF({ sort: f.sort, page: 1 });
    startTransition(() => { router.push("/automobili"); setOpen(false); });
  }

  const panel = (
    <div className="flex flex-col gap-4">
      <FieldWrap label="Marka"><Select options={makeOpts} value={s(f.make)} onChange={set("make")} placeholder="Sve marke" searchable clearable size="sm" /></FieldWrap>
      <FieldWrap label="Model"><Select options={modelOpts} value={s(f.model)} onChange={set("model")} placeholder="Svi modeli" searchable clearable disabled={!f.make} size="sm" /></FieldWrap>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrap label="Cijena od"><Select options={PRICES} value={s(f.priceMin)} onChange={set("priceMin")} placeholder="Od" clearable size="sm" /></FieldWrap>
        <FieldWrap label="Cijena do"><Select options={PRICES} value={s(f.priceMax)} onChange={set("priceMax")} placeholder="Do" clearable size="sm" /></FieldWrap>
        <FieldWrap label="Godište od"><Select options={YEARS} value={s(f.yearMin)} onChange={set("yearMin")} placeholder="Od" searchable clearable size="sm" /></FieldWrap>
        <FieldWrap label="Godište do"><Select options={YEARS} value={s(f.yearMax)} onChange={set("yearMax")} placeholder="Do" searchable clearable size="sm" /></FieldWrap>
      </div>
      <FieldWrap label="Kilometraža"><Select options={KMS} value={s(f.kmMax)} onChange={set("kmMax")} placeholder="Bilo koja" clearable size="sm" /></FieldWrap>
      <FieldWrap label="Gorivo"><Select options={FUEL_OPTS} value={s(f.fuel)} onChange={set("fuel")} placeholder="Sva goriva" clearable size="sm" /></FieldWrap>
      <FieldWrap label="Mjenjač"><Select options={TRANS_OPTS} value={s(f.transmission)} onChange={set("transmission")} placeholder="Svi" clearable size="sm" /></FieldWrap>
      <FieldWrap label="Karoserija"><Select options={BODY_OPTS} value={s(f.body)} onChange={set("body")} placeholder="Sve" clearable size="sm" /></FieldWrap>
      <FieldWrap label="Grad"><Select options={cityOpts} value={s(f.city)} onChange={set("city")} placeholder="Svi gradovi" searchable clearable size="sm" /></FieldWrap>
      <div className="mt-2 flex gap-2">
        <Button onClick={apply} disabled={pending} fullWidth>{pending ? "Tražim…" : "Primijeni"}</Button>
        {activeCount > 0 && <Button onClick={reset} variant="outline" aria-label="Poništi filtere"><X size={16} aria-hidden="true" /></Button>}
      </div>
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="mb-4 inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-semibold lg:hidden">
        <SlidersHorizontal size={16} aria-hidden="true" /> Filteri {activeCount > 0 && <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-white">{activeCount}</span>}
      </button>
      <aside className={cn("card p-5 lg:block", open ? "block" : "hidden")} aria-label="Filteri">
        {panel}
      </aside>
    </>
  );
}
