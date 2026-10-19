import Link from "next/link";
import { Car, Flag, ShieldCheck, Store } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Placevi", icon: Store },
  { href: "/admin/oglasi", label: "Oglasi", icon: Car },
  { href: "/admin/prijave", label: "Prijave", icon: Flag },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="container-page flex gap-10 py-8">
      <aside className="hidden w-52 shrink-0 md:block">
        <p className="eyebrow text-muted mb-3 flex items-center gap-2">
          <ShieldCheck size={14} aria-hidden="true" /> Administracija
        </p>
        <nav className="flex flex-col gap-1" aria-label="Admin navigacija">
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
