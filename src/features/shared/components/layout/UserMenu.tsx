"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Button from "@/features/shared/components/ui/Button";

/**
 * Sesija se čita na klijentu (useSession -> /api/auth/session) da bi header ostao u
 * statičnoj ljusci. Suspense u root layoutu bi pokrenuo streaming prije notFound()
 * i svaki 404 bi postao 200 (docs/RENDERING.md, pravilo 11).
 */
export default function UserMenu({ stacked = false }: { stacked?: boolean }) {
  const { data: session, status } = useSession();
  const wrap = stacked ? "flex flex-col gap-2" : "flex items-center gap-2";

  if (status === "loading") return <div className={stacked ? "h-20" : "h-9 w-48"} aria-hidden="true" />;

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
      <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="px-2 text-sm text-muted hover:text-foreground">Odjava</button>
    </div>
  );
}
