import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { auth, signOut } from "@/auth";
import Logo from "@/features/shared/components/ui/Logo";
import Button from "@/features/shared/components/ui/Button";

async function UserMenu() {
  await connection(); // Auth.js koristi crypto prije čitanja kolačića, pa prerender mora da zna da je ovo dinamično
  const session = await auth();
  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button href="/prijava" variant="ghost" size="sm">Prijava</Button>
        <Button href="/registracija" variant="secondary" size="sm">Registracija</Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Button href="/plac" size="sm">Moj autoplac</Button>
      <Link href="/nalog" className="hidden text-sm font-medium hover:text-accent sm:inline">{session.user.name}</Link>
      <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
        <button type="submit" className="text-sm text-muted hover:text-foreground">Odjava</button>
      </form>
    </div>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="container-page flex h-(--header-h) items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Glavna navigacija">
          <Link href="/automobili" className="transition-colors hover:text-accent">Automobili</Link>
          <Link href="/placevi" className="transition-colors hover:text-accent">Autoplacevi</Link>
        </nav>
        <Suspense fallback={<div className="h-9 w-44" />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}
