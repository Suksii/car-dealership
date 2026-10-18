import Link from "next/link";
import { Suspense } from "react";
import { auth, signOut } from "@/auth";

async function UserMenu() {
  const session = await auth();
  if (!session) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/prijava" className="hover:underline">Prijava</Link>
        <Link href="/registracija" className="rounded-md bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700">Registracija</Link>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href="/nalog" className="hover:underline">{session.user.name}</Link>
      <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
        <button type="submit" className="text-zinc-600 hover:underline">Odjava</button>
      </form>
    </div>
  );
}

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">Autoplac</Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/automobili" className="hover:underline">Automobili</Link>
          <Link href="/placevi" className="hover:underline">Autoplacevi</Link>
          <Suspense fallback={<div className="h-8 w-32" />}>
            <UserMenu />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
