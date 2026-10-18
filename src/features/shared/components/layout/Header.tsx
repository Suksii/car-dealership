import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { auth, signOut } from "@/auth";
import Logo from "@/features/shared/components/ui/Logo";
import Button from "@/features/shared/components/ui/Button";
import MobileMenu from "@/features/shared/components/layout/MobileMenu";

async function UserMenu({ stacked = false }: { stacked?: boolean }) {
  await connection(); // Auth.js koristi crypto prije čitanja kolačića (docs/RENDERING.md, pravilo 2)
  const session = await auth();
  const wrap = stacked ? "flex flex-col gap-2" : "flex items-center gap-2";
  if (!session) {
    return (
      <div className={wrap}>
        <Button href="/prijava" variant="ghost" size="sm" fullWidth={stacked}>Prijava</Button>
        <Button href="/registracija" variant="secondary" size="sm" fullWidth={stacked}>Registracija</Button>
      </div>
    );
  }
  return (
    <div className={wrap}>
      <Button href="/plac" size="sm" fullWidth={stacked}>Moj autoplac</Button>
      <Link href="/nalog" className="px-2 text-sm font-medium hover:text-accent">{session.user.name}</Link>
      <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
        <button type="submit" className="px-2 text-sm text-muted hover:text-foreground">Odjava</button>
      </form>
    </div>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="container-page flex h-(--header-h) items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Glavna navigacija">
          <Link href="/automobili" className="transition-colors hover:text-accent">Automobili</Link>
          <Link href="/placevi" className="transition-colors hover:text-accent">Autoplacevi</Link>
        </nav>
        <div className="hidden md:block">
          <Suspense fallback={<div className="h-9 w-48" />}><UserMenu /></Suspense>
        </div>
        <MobileMenu>
          <Suspense fallback={<div className="h-9" />}><UserMenu stacked /></Suspense>
        </MobileMenu>
      </div>
    </header>
  );
}
