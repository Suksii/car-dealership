"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Select from "@/features/shared/components/ui/Select";
import Button from "@/features/shared/components/ui/Button";
import type { Catalog } from "@/lib/catalog";

const PRICE_STEPS = [3000, 5000, 8000, 10000, 15000, 20000, 30000, 50000];

type Props = { makes: Catalog["makes"]; models: Pick<Catalog["models"][number], "id" | "makeId" | "name" | "slug">[]; cities: Catalog["cities"] };

export default function SearchBox({ makes, models, cities }: Props) {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");

  const makeOpts = useMemo(() => makes.map((m) => ({ value: m.slug, label: m.name })), [makes]);
  const makeId = makes.find((m) => m.slug === make)?.id;
  const modelOpts = useMemo(() => models.filter((m) => m.makeId === makeId).map((m) => ({ value: m.slug, label: m.name })), [models, makeId]);
  const cityOpts = useMemo(() => cities.map((c) => ({ value: c.slug, label: c.name })), [cities]);
  const priceOpts = PRICE_STEPS.map((p) => ({ value: String(p), label: `do ${p.toLocaleString("sr-Latn-ME")} €` }));

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
    <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-surface p-3 shadow-custom md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:p-4">
      <Select options={makeOpts} value={make} onChange={(v) => { setMake(v); setModel(""); }} placeholder="Marka" searchable clearable />
      <Select options={modelOpts} value={model} onChange={setModel} placeholder="Model" searchable clearable disabled={!make} />
      <Select options={priceOpts} value={price} onChange={setPrice} placeholder="Cijena do" clearable />
      <Select options={cityOpts} value={city} onChange={setCity} placeholder="Grad" searchable clearable />
      <Button type="submit" size="lg" className="h-12 md:px-6"><Search size={18} aria-hidden="true" /> Pretraži</Button>
    </form>
  );
}
