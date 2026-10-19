import Link from "next/link";
import { X } from "lucide-react";
import type { FilterChip } from "@/features/listings/lib/filters";

interface Props {
  chips: FilterChip[];
  basePath?: string;
  className?: string;
}

/** Red aktivnih filtera sa × za uklanjanje pojedinačnog i linkom za brisanje svih. */
export default function ActiveFilterChips({ chips, basePath = "/automobili", className }: Props) {
  if (chips.length === 0) return null;
  const href = (q: string) => (q ? `${basePath}?${q}` : basePath);
  return (
    <ul className={className} aria-label="Aktivni filteri">
      {chips.map((c) => (
        <li key={c.key} className="inline-flex">
          <Link
            href={href(c.query)}
            aria-label={`Ukloni filter: ${c.label}`}
            className="bg-foreground inline-flex h-8 items-center gap-1.5 rounded-full pr-2 pl-3 text-xs font-semibold text-white transition-colors hover:bg-neutral-700"
          >
            <span>{c.label}</span>
            <X size={14} aria-hidden="true" />
          </Link>
        </li>
      ))}
      {chips.length > 1 && (
        <li className="inline-flex">
          <Link
            href={basePath}
            className="text-muted hover:text-foreground inline-flex h-8 items-center px-2 text-xs font-semibold underline-offset-2 hover:underline"
          >
            Poništi sve
          </Link>
        </li>
      )}
    </ul>
  );
}
