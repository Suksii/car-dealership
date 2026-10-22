import Link from "next/link";
import { Car, Store } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const NAV_LINKS = [
  { href: "/automobili", label: "Automobili", icon: Car },
  { href: "/placevi", label: "Autoplacevi", icon: Store },
] as const;

interface Props {
  /** Trenutna putanja; bez nje nijedan link nije aktivan (fallback dok se putanja ne zna). */
  pathname?: string;
  stacked?: boolean;
  onNavigate?: () => void;
}

/**
 * Glavni linkovi. Desktop: segmentirana pilula (aktivna stavka bijela sa sjenkom).
 * Mobilni meni (`stacked`): veće stavke sa ikonom. Aktivno stanje računa `ActiveNavLinks`.
 */
export default function NavLinks({ pathname, stacked = false, onNavigate }: Props) {
  return (
    <ul className={cn("flex", stacked ? "flex-col gap-1" : "items-center gap-0.5 rounded-full bg-neutral-100 p-1")}>
      {NAV_LINKS.map((l) => {
        const active = !!pathname && (pathname === l.href || pathname.startsWith(`${l.href}/`));
        const Icon = l.icon;
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 font-semibold transition-colors",
                stacked ? "rounded-xl px-3 py-3 text-base" : "rounded-full px-4 py-1.5 text-sm",
                active
                  ? stacked
                    ? "text-foreground bg-neutral-100"
                    : "bg-surface text-foreground shadow-xs"
                  : "hover:text-foreground text-neutral-600" + (stacked ? " hover:bg-neutral-100" : ""),
              )}
            >
              {stacked && <Icon size={20} className={active ? "text-accent" : "text-neutral-500"} aria-hidden="true" />}
              <span>{l.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
