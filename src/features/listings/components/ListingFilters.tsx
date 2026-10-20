"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import Select from "@/features/shared/components/ui/Select";
import Button from "@/features/shared/components/ui/Button";
import { FieldWrap } from "@/features/shared/components/ui/Field";
import { FUEL, TRANSMISSION, BODY } from "@/features/listings/lib/labels";
import { filtersToQuery, countActiveFilters, PRICE_STEPS, KM_STEPS } from "@/features/listings/lib/filters";
import { loadModels, loadListingCount } from "@/features/listings/catalog-actions";
import { useListingsTransition } from "@/features/listings/components/ListingsTransition";
import type { SlimModel } from "@/features/listings/api/getModels";
import type { ListingFilters as Filters } from "@/features/listings/api/getListings";
import type { Catalog } from "@/lib/catalog";
import { cn } from "@/lib/utils/cn";
import { pluralSr } from "@/lib/utils/format";
import { useIsClient } from "@/lib/hooks/useIsClient";
import { usePresence } from "@/lib/hooks/usePresence";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useKeyboardNav } from "@/lib/hooks/useKeyboardNav";
import { useDebounce } from "@/lib/hooks/useDebounce";

type Props = {
  filters: Filters;
  makes: Catalog["makes"];
  models: SlimModel[];
  cities: Catalog["cities"];
  activeCount: number;
  /** Ukupan broj oglasa za trenutne filtere (početna vrijednost brojača u sheet-u). */
  total: number;
  /** Na telefonu desno od dugmeta „Filteri" (sortiranje). */
  children?: ReactNode;
};

const toOpts = (m: Record<string, string>) => Object.entries(m).map(([value, label]) => ({ value, label }));
const FUEL_OPTS = toOpts(FUEL),
  TRANS_OPTS = toOpts(TRANSMISSION),
  BODY_OPTS = toOpts(BODY);
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => String(CURRENT_YEAR - i)).map((y) => ({
  value: y,
  label: y,
}));
const PRICES = PRICE_STEPS.map((p) => ({
  value: String(p),
  label: `${p.toLocaleString("sr-Latn-ME")} €`,
}));
const KMS = KM_STEPS.map((k) => ({
  value: String(k),
  label: `do ${k.toLocaleString("sr-Latn-ME")} km`,
}));

export default function ListingFilters({ filters, makes, models, cities, activeCount, total, children }: Props) {
  const router = useRouter();
  const { pending, startTransition } = useListingsTransition();
  const [open, setOpen] = useState(false); // sheet na telefonu
  const [f, setF] = useState<Filters>(filters);
  const [modelList, setModelList] = useState<SlimModel[]>(models);
  const [count, setCount] = useState(total);
  const panelId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  const sheet = usePresence(open);
  useBodyScrollLock(open);
  useFocusTrap(sheetRef, open);
  // Escape samo iz sheet-a (Select-ov sheet je u portalu van njega, pa ne zatvara oba).
  useKeyboardNav({ Escape: () => close() }, { target: sheetRef, enabled: open });

  // Brojač „Prikaži N oglasa": za nacrt filtera, sa zadrškom, samo dok je sheet otvoren.
  const draft = useDebounce(f, 300);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadListingCount({ ...draft, sort: undefined, page: undefined }).then((n) => {
      if (!cancelled && n !== null) setCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, [open, draft]);

  const makeOpts = useMemo(() => makes.map((m) => ({ value: m.slug, label: m.name })), [makes]);
  const makeId = makes.find((m) => m.slug === f.make)?.id;
  const modelOpts = useMemo(
    () => modelList.filter((m) => m.makeId === makeId).map((m) => ({ value: m.slug, label: m.name })),
    [modelList, makeId],
  );
  useEffect(() => {
    if (!makeId || modelList.some((m) => m.makeId === makeId)) return;
    let cancelled = false;
    loadModels(makeId).then((m) => {
      if (!cancelled) setModelList(m);
    });
    return () => {
      cancelled = true;
    };
  }, [makeId, modelList]);
  const cityOpts = useMemo(() => cities.map((c) => ({ value: c.slug, label: c.name })), [cities]);

  const set =
    <K extends keyof Filters>(k: K) =>
    (v: string) =>
      setF((p) => ({
        ...p,
        [k]:
          v === ""
            ? undefined
            : typeof p[k] === "number" || ["priceMin", "priceMax", "yearMin", "yearMax", "kmMax"].includes(k)
              ? Number(v)
              : v,
        page: 1,
        ...(k === "make" ? { model: undefined } : {}),
      }));
  const s = (v: number | string | undefined) => (v === undefined ? "" : String(v));
  type ManyKey = "model" | "city" | "fuel" | "transmission" | "body";
  const setMany = (k: ManyKey) => (v: string[]) =>
    setF((p) => ({ ...p, [k]: v.length ? (v as Filters[ManyKey]) : undefined, page: 1 }));

  function close() {
    setOpen(false);
    setF(filters);
    setCount(total);
  }
  function apply() {
    const q = filtersToQuery({ ...f, page: 1 });
    startTransition(() => {
      router.push(`/automobili${q ? `?${q}` : ""}`);
      setOpen(false);
    });
  }
  /** Desktop: briše nacrt i odmah primjenjuje. Sheet: samo briše nacrt, brojač se osvježi, korisnik potvrdi. */
  function reset(navigate: boolean) {
    setF({ sort: f.sort, page: 1 });
    if (!navigate || activeCount === 0) return;
    startTransition(() => router.push("/automobili"));
  }

  const fields = (
    <>
      <FieldWrap label="Marka">
        <Select
          aria-label="Marka"
          options={makeOpts}
          value={s(f.make)}
          onChange={set("make")}
          placeholder="Sve marke"
          searchable
          clearable
          size="sm"
        />
      </FieldWrap>
      <FieldWrap label="Model">
        <Select
          aria-label="Model"
          options={modelOpts}
          multiple
          values={f.model ?? []}
          onValuesChange={setMany("model")}
          placeholder="Svi modeli"
          searchable
          clearable
          disabled={!f.make}
          size="sm"
        />
      </FieldWrap>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrap label="Cijena od">
          <Select
            aria-label="Cijena od"
            options={PRICES}
            value={s(f.priceMin)}
            onChange={set("priceMin")}
            placeholder="Od"
            searchable
            clearable
            size="sm"
          />
        </FieldWrap>
        <FieldWrap label="Cijena do">
          <Select
            aria-label="Cijena do"
            options={PRICES}
            value={s(f.priceMax)}
            onChange={set("priceMax")}
            placeholder="Do"
            searchable
            clearable
            size="sm"
          />
        </FieldWrap>
        <FieldWrap label="Godište od">
          <Select
            aria-label="Godište od"
            options={YEARS}
            value={s(f.yearMin)}
            onChange={set("yearMin")}
            placeholder="Od"
            searchable
            clearable
            size="sm"
          />
        </FieldWrap>
        <FieldWrap label="Godište do">
          <Select
            aria-label="Godište do"
            options={YEARS}
            value={s(f.yearMax)}
            onChange={set("yearMax")}
            placeholder="Do"
            searchable
            clearable
            size="sm"
          />
        </FieldWrap>
      </div>
      <FieldWrap label="Kilometraža">
        <Select
          aria-label="Kilometraža"
          options={KMS}
          value={s(f.kmMax)}
          onChange={set("kmMax")}
          placeholder="Bilo koja"
          searchable
          clearable
          size="sm"
        />
      </FieldWrap>
      <FieldWrap label="Gorivo">
        <Select
          aria-label="Gorivo"
          options={FUEL_OPTS}
          multiple
          values={f.fuel ?? []}
          onValuesChange={setMany("fuel")}
          placeholder="Sva goriva"
          clearable
          size="sm"
        />
      </FieldWrap>
      <FieldWrap label="Mjenjač">
        <Select
          aria-label="Mjenjač"
          options={TRANS_OPTS}
          multiple
          values={f.transmission ?? []}
          onValuesChange={setMany("transmission")}
          placeholder="Svi"
          clearable
          size="sm"
        />
      </FieldWrap>
      <FieldWrap label="Karoserija">
        <Select
          aria-label="Karoserija"
          options={BODY_OPTS}
          multiple
          values={f.body ?? []}
          onValuesChange={setMany("body")}
          placeholder="Sve"
          clearable
          size="sm"
        />
      </FieldWrap>
      <FieldWrap label="Grad">
        <Select
          aria-label="Grad"
          options={cityOpts}
          multiple
          values={f.city ?? []}
          onValuesChange={setMany("city")}
          placeholder="Svi gradovi"
          searchable
          clearable
          size="sm"
        />
      </FieldWrap>
    </>
  );

  const draftActive = countActiveFilters(f);
  const resetLink = (navigate: boolean) =>
    (draftActive > 0 || activeCount > 0) && (
      <button
        type="button"
        onClick={() => reset(navigate)}
        className="text-muted hover:text-foreground text-sm font-semibold underline-offset-2 transition-colors hover:underline"
      >
        Poništi
      </button>
    );
  const applyLabel =
    count === 0 ? "Nema oglasa za ove filtere" : `Prikaži ${count} ${pluralSr(count, ["oglas", "oglasa", "oglasa"])}`;

  return (
    <>
      <div className="mb-4 flex gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls={panelId}
          className="border-border inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border bg-white px-4 text-sm font-semibold transition-colors hover:border-neutral-400"
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          <span>Filteri</span>
          {activeCount > 0 && (
            <span className="bg-accent rounded-full px-2 py-0.5 text-xs text-white">{activeCount}</span>
          )}
        </button>
        {children}
      </div>

      <aside className="card hidden p-5 lg:block" aria-label="Filteri">
        <div className="flex flex-col gap-4">
          <div className="flex h-6 items-center justify-between gap-3">
            <p className="text-base font-bold">Filteri</p>
            {resetLink(true)}
          </div>
          {fields}
          <Button onClick={apply} disabled={pending} fullWidth className="mt-2">
            {pending ? "Tražim…" : "Primijeni"}
          </Button>
        </div>
      </aside>

      {sheet.mounted &&
        isClient &&
        createPortal(
          <>
            <div
              aria-hidden="true"
              onClick={close}
              className={cn("fixed inset-0 z-60 bg-black/40", sheet.closing ? "anim-fade-out" : "anim-fade-in")}
            />
            <div
              ref={sheetRef}
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Filteri"
              tabIndex={-1}
              inert={sheet.closing}
              className={cn(
                "sheet-full fixed inset-x-0 bottom-0 z-60 flex flex-col rounded-t-3xl bg-white shadow-2xl outline-none",
                sheet.closing ? "anim-slide-down" : "anim-slide-up",
              )}
            >
              <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-neutral-300" aria-hidden="true" />
              <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-3 pb-2">
                <p className="text-base font-bold">Filteri</p>
                <div className="flex items-center gap-4">
                  {resetLink(false)}
                  <button type="button" aria-label="Zatvori" onClick={close} className="-m-2 p-2 text-neutral-500">
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-3">{fields}</div>
              <div className="border-border shrink-0 border-t p-4">
                <Button onClick={apply} disabled={pending || count === 0} fullWidth>
                  {pending ? "Tražim…" : applyLabel}
                </Button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
