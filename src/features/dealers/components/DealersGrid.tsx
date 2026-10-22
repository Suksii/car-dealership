"use client";

import { useState } from "react";
import DealerCard from "@/features/dealers/components/DealerCard";
import type { DealerCardItem } from "@/features/dealers/api/getDealers";
import { cn } from "@/lib/utils/cn";

/**
 * Svi placevi u jednoj mreži, sa čipovima za grad iznad (filtrira na klijentu, stranica ostaje statična).
 * Ranije je svaki grad bio svoj red, pa je grad sa jednim placem ostavljao dvije trećine reda prazne.
 */
export default function DealersGrid({ dealers }: { dealers: DealerCardItem[] }) {
  const [city, setCity] = useState<string | null>(null);
  const counts = new Map<string, number>();
  for (const d of dealers) counts.set(d.city, (counts.get(d.city) ?? 0) + 1);
  const cities = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "sr"));
  const visible = city ? dealers.filter((d) => d.city === city) : dealers;

  const chip = (label: string, n: number, value: string | null) => (
    <li key={label}>
      <button
        type="button"
        onClick={() => setCity(value)}
        aria-pressed={city === value}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors",
          city === value
            ? "bg-foreground border-foreground text-white"
            : "border-border bg-surface hover:border-neutral-400",
        )}
      >
        <span>{label}</span>
        <span className={city === value ? "text-white/60" : "text-muted"}>{n}</span>
      </button>
    </li>
  );

  return (
    <div className="flex flex-col gap-5">
      {cities.length > 1 && (
        <ul className="flex flex-wrap gap-2" aria-label="Grad">
          {chip("Svi gradovi", dealers.length, null)}
          {cities.map(([c, n]) => chip(c, n, c))}
        </ul>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((d) => (
          <DealerCard key={d.id} dealer={d} />
        ))}
      </div>
    </div>
  );
}
