import Link from "next/link";
import Logo from "@/features/shared/components/ui/Logo";
import { SITE } from "@/config/site";

const YEAR = new Date().getFullYear(); // module scope, ne u renderu (prerender)

const COLS = [
  { title: "Kupci", links: [["/automobili", "Svi automobili"], ["/automobili?gorivo=diesel", "Dizel"], ["/automobili?karoserija=suv", "SUV i džipovi"], ["/placevi", "Autoplacevi"]] },
  { title: "Autoplacevi", links: [["/plac/registracija", "Registruj autoplac"], ["/plac", "Moj autoplac"], ["/prijava", "Prijava"]] },
] as const;

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted">{SITE.description}</p>
          <a href={`mailto:${SITE.email}`} className="text-sm font-medium hover:text-accent">{SITE.email}</a>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="eyebrow mb-3 text-muted">{c.title}</p>
            <ul className="flex flex-col gap-2 text-sm">
              {c.links.map(([href, label]) => <li key={href}><Link href={href} className="hover:text-accent">{label}</Link></li>)}
            </ul>
          </nav>
        ))}
      </div>
      <div className="container-page flex flex-wrap items-center justify-between gap-2 border-t border-border py-5 text-xs text-muted">
        <span>© {YEAR} {SITE.name}. Sva prava zadržana.</span>
        <span>Napravljeno u Podgorici.</span>
      </div>
    </footer>
  );
}
