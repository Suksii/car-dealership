import Link from "next/link";
import { Car, LayoutDashboard, PlusCircle, Store } from "lucide-react";

const NAV = [
  { href: "/plac", label: "Pregled", icon: LayoutDashboard },
  { href: "/plac/oglasi/novi", label: "Novi oglas", icon: PlusCircle },
  { href: "/plac/profil", label: "Profil placa", icon: Store },
];

export default function PlacLayout({ children }: LayoutProps<"/plac">) {
  return (
    <div className="container-page flex gap-10 py-8">
      <aside className="hidden w-52 shrink-0 md:block">
        <p className="eyebrow text-muted mb-3 flex items-center gap-2">
          <Car size={14} aria-hidden="true" /> Moj autoplac
        </p>
        <nav className="flex flex-col gap-1" aria-label="Panel navigacija">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="hover:bg-surface hover:text-accent flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              <Icon size={16} aria-hidden="true" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
