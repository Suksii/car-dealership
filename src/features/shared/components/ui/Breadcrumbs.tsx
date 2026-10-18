import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem { label: string; href?: string }

export default function Breadcrumbs({ items, home = true }: { items: BreadcrumbItem[]; home?: boolean }) {
  const all = home ? [{ label: "Početna", href: "/" }, ...items] : items;
  return (
    <nav aria-label="Putanja" className="scrollbar-hide overflow-x-auto sm:overflow-visible">
      <ol className="flex flex-nowrap items-center gap-1.5 text-sm text-muted sm:flex-wrap">
        {all.map((item, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
              {item.href && !last
                ? <Link href={item.href} className="transition-colors hover:text-foreground">{item.label}</Link>
                : <span aria-current={last ? "page" : undefined} className={last ? "font-semibold text-foreground" : ""}>{item.label}</span>}
              {!last && <ChevronRight size={14} className="text-neutral-300" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
