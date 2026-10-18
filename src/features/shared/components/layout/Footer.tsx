import Link from "next/link";
import Logo from "@/features/shared/components/ui/Logo";
import { SITE } from "@/config/site";

const YEAR = new Date().getFullYear(); // module scope, ne u renderu (prerender)

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="container-page flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted">{SITE.tagline}</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Footer navigacija">
          <Link href="/automobili" className="hover:text-accent">Automobili</Link>
          <Link href="/placevi" className="hover:text-accent">Autoplacevi</Link>
          <Link href="/plac/registracija" className="hover:text-accent">Registruj autoplac</Link>
        </nav>
      </div>
      <div className="container-page border-t border-border py-4 text-xs text-muted">© {YEAR} {SITE.name}</div>
    </footer>
  );
}
