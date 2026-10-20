"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRICE_STEPS } from "@/features/listings/lib/filters";
import { Search } from "lucide-react";
import Select from "@/features/shared/components/ui/Select";
import Button from "@/features/shared/components/ui/Button";
import { loadModels } from "@/features/listings/catalog-actions";
import type { SlimModel } from "@/features/listings/api/getModels";
import type { Catalog } from "@/lib/catalog";

type Props = { makes: Catalog["makes"]; cities: Catalog["cities"] };

export default function SearchBox({ makes, cities }: Props) {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [models, setModels] = useState<SlimModel[]>([]);

  const makeOpts = useMemo(() => makes.map((m) => ({ value: m.slug, label: m.name })), [makes]);
  const makeId = makes.find((m) => m.slug === make)?.id;
  const modelOpts = useMemo(() => models.map((m) => ({ value: m.slug, label: m.name })), [models]);
  const cityOpts = useMemo(() => cities.map((c) => ({ value: c.slug, label: c.name })), [cities]);
  const priceOpts = PRICE_STEPS.map((p) => ({ value: String(p), label: `do ${p.toLocaleString("sr-Latn-ME")} €` }));

  useEffect(() => {
    if (!makeId) return;
    let cancelled = false;
    loadModels(makeId).then((m) => {
      if (!cancelled) setModels(m);
    });
    return () => {
      cancelled = true;
    };
  }, [makeId]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (make) q.set("marka", make);
    if (model) q.set("model", model);
    if (price) q.set("cijena_do", price);
    if (city) q.set("grad", city);
    router.push(`/automobili${q.size ? `?${q}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      aria-label="Pretraga vozila"
      className="bg-surface shadow-custom grid gap-2.5 rounded-2xl p-3 md:grid-cols-[1.1fr_1.1fr_1fr_1fr_auto] md:gap-3 md:p-3.5"
    >
      <Select
        aria-label="Marka"
        options={makeOpts}
        value={make}
        onChange={(v) => {
          setMake(v);
          setModel("");
          setModels([]);
        }}
        placeholder="Marka"
        searchable
        clearable
      />
      <Select
        aria-label="Model"
        options={modelOpts}
        value={model}
        onChange={setModel}
        placeholder="Model"
        searchable
        clearable
        disabled={!make}
      />
      <Select
        aria-label="Cijena do"
        options={priceOpts}
        value={price}
        onChange={setPrice}
        placeholder="Cijena do"
        searchable
        clearable
      />
      <Select
        aria-label="Grad"
        options={cityOpts}
        value={city}
        onChange={setCity}
        placeholder="Grad"
        searchable
        clearable
      />
      <Button type="submit" size="lg" className="h-12 md:px-6">
        <Search size={18} aria-hidden="true" /> Pretraži
      </Button>
    </form>
  );
}
