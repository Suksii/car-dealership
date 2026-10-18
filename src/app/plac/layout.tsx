import Link from "next/link";
import { Car, LayoutDashboard, PlusCircle, Store } from "lucide-react";

const nav = [
  { href: "/plac", label: "Pregled", icon: LayoutDashboard },
  { href: "/plac/oglasi/novi", label: "Novi oglas", icon: PlusCircle },
  { href: "/plac/profil", label: "Profil placa", icon: Store },
];

export default function PlacLayout({ children }: LayoutProps<"/plac">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 py-8">
      <aside className="hidden w-48 shrink-0 md:block">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted"><Car size={14} /> Moj autoplac</p>
        <nav className="flex flex-col gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white hover:text-accent">
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
