import Link from "next/link";
import Logo from "@/features/shared/components/ui/Logo";
import MobileMenu from "@/features/shared/components/layout/MobileMenu";
import UserMenu from "@/features/shared/components/layout/UserMenu";

/** Statičan: ništa ovdje ne smije da suspenduje (sesija ide na klijentu kroz UserMenu). */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="container-page flex h-(--header-h) items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Glavna navigacija">
          <Link href="/automobili" className="transition-colors hover:text-accent">Automobili</Link>
          <Link href="/placevi" className="transition-colors hover:text-accent">Autoplacevi</Link>
        </nav>
        <div className="hidden md:block"><UserMenu /></div>
        <MobileMenu><UserMenu stacked /></MobileMenu>
      </div>
    </header>
  );
}
