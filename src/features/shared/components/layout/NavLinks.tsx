import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export const NAV_LINKS = [
  { href: "/automobili", label: "Automobili" },
  { href: "/placevi", label: "Autoplacevi" },
] as const;

interface Props {
  /** Trenutna putanja; bez nje nijedan link nije aktivan (fallback dok se putanja ne zna). */
  pathname?: string;
  stacked?: boolean;
  onNavigate?: () => void;
}

/** Glavni linkovi. Aktivno stanje računa `ActiveNavLinks` (klijent, usePathname). */
export default function NavLinks({ pathname, stacked = false, onNavigate }: Props) {
  return (
    <ul className={cn("flex", stacked ? "flex-col gap-1" : "items-center gap-1")}>
      {NAV_LINKS.map((l) => {
        const active = !!pathname && (pathname === l.href || pathname.startsWith(`${l.href}/`));
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block rounded-lg font-semibold transition-colors",
                stacked ? "px-3 py-2.5 text-base" : "px-3 py-2 text-sm",
                active
                  ? "text-foreground bg-neutral-100"
                  : "hover:text-foreground text-neutral-600 hover:bg-neutral-100",
              )}
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
