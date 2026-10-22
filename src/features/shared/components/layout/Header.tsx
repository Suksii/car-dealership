import { Suspense } from "react";
import Logo from "@/features/shared/components/ui/Logo";
import NavLinks from "@/features/shared/components/layout/NavLinks";
import ActiveNavLinks from "@/features/shared/components/layout/ActiveNavLinks";
import MobileMenu from "@/features/shared/components/layout/MobileMenu";
import UserMenu from "@/features/shared/components/layout/UserMenu";
import FavoritesLink from "@/features/favorites/components/FavoritesLink";

/** Statičan: ništa ovdje ne smije da čeka na podatke (sesija ide na klijentu kroz UserMenu i FavoritesLink). */
export default function Header() {
  return (
    <header className="border-border bg-surface/90 sticky top-0 z-40 border-b backdrop-blur">
      <div className="container-page flex h-(--header-h) items-center gap-4">
        <Logo />
        <nav className="hidden md:ml-4 md:block" aria-label="Glavna navigacija">
          {/* Suspense je ovdje dozvoljen: fallback je isti sadržaj bez aktivnog stanja, a putanja se zna odmah na zahtjevu (docs/RENDERING.md, 11). */}
          <Suspense fallback={<NavLinks />}>
            <ActiveNavLinks />
          </Suspense>
        </nav>
        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <FavoritesLink />
          <div className="hidden md:block">
            <UserMenu />
          </div>
          <div className="md:hidden">
            <MobileMenu>
              <UserMenu stacked />
            </MobileMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
