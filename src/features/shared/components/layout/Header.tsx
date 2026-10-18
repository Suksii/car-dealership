import { Suspense } from "react";
import Logo from "@/features/shared/components/ui/Logo";
import NavLinks from "@/features/shared/components/layout/NavLinks";
import ActiveNavLinks from "@/features/shared/components/layout/ActiveNavLinks";
import MobileMenu from "@/features/shared/components/layout/MobileMenu";
import UserMenu from "@/features/shared/components/layout/UserMenu";

/** Statičan: ništa ovdje ne smije da čeka na podatke (sesija ide na klijentu kroz UserMenu). */
export default function Header() {
  return (
    <header className="border-border bg-surface/90 sticky top-0 z-40 border-b backdrop-blur">
      <div className="container-page flex h-(--header-h) items-center gap-6">
        <Logo />
        <nav className="hidden md:block" aria-label="Glavna navigacija">
          {/* Suspense je ovdje dozvoljen: fallback je isti sadržaj bez aktivnog stanja, a putanja se zna odmah na zahtjevu (docs/RENDERING.md, 11). */}
          <Suspense fallback={<NavLinks />}>
            <ActiveNavLinks />
          </Suspense>
        </nav>
        <div className="ml-auto hidden md:block">
          <UserMenu />
        </div>
        <div className="ml-auto md:hidden">
          <MobileMenu>
            <UserMenu stacked />
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
