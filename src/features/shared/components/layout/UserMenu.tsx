"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ChevronDown, Heart, LogOut, ShieldCheck, Store, UserRound } from "lucide-react";
import Button from "@/features/shared/components/ui/Button";
import { useOutsideClick } from "@/lib/hooks/useOutsideClick";
import { useKeyboardNav } from "@/lib/hooks/useKeyboardNav";
import { cn } from "@/lib/utils/cn";

/**
 * Sesija se čita na klijentu (useSession -> /api/auth/session) da bi header ostao u
 * statičnoj ljusci. Suspense u root layoutu bi pokrenuo streaming prije notFound()
 * i svaki 404 bi postao 200 (docs/RENDERING.md, pravilo 11).
 */
export default function UserMenu({ stacked = false }: { stacked?: boolean }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false), open);
  useKeyboardNav({ Escape: () => setOpen(false) }, { enabled: open });

  if (status === "loading") return <div className={stacked ? "h-24" : "h-10 w-56"} aria-hidden="true" />;

  if (!session) {
    return (
      <div className={stacked ? "flex flex-col gap-2" : "flex items-center gap-2"}>
        <Button href="/prijava" variant="ghost" size="sm" fullWidth={stacked}>
          Prijava
        </Button>
        <Button href="/plac/registracija" variant="secondary" size="sm" fullWidth={stacked}>
          Registruj autoplac
        </Button>
      </div>
    );
  }

  const initials = (session.user.name ?? session.user.email ?? "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const logout = () => signOut({ callbackUrl: "/" });

  if (stacked) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 px-1 pb-2">
          <Avatar initials={initials} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{session.user.name}</p>
            <p className="text-muted truncate text-xs">{session.user.email}</p>
          </div>
        </div>
        <Button href="/plac" size="sm" fullWidth>
          <Store size={16} aria-hidden="true" /> Moj autoplac
        </Button>
        <Button href="/nalog/favoriti" variant="outline" size="sm" fullWidth>
          <Heart size={16} aria-hidden="true" /> Sačuvani oglasi
        </Button>
        <Button href="/nalog" variant="outline" size="sm" fullWidth>
          <UserRound size={16} aria-hidden="true" /> Moj nalog
        </Button>
        {session.user.role === "admin" && (
          <Button href="/admin" variant="outline" size="sm" fullWidth>
            <ShieldCheck size={16} aria-hidden="true" /> Admin
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" fullWidth onClick={logout}>
          <LogOut size={16} aria-hidden="true" /> Odjava
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button href="/plac" size="sm">
        <Store size={16} aria-hidden="true" /> Moj autoplac
      </Button>
      <div ref={ref} className="relative">
        <button
          type="button"
          aria-label="Korisnički meni"
          aria-expanded={open}
          aria-controls="user-menu-panel"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex h-10 items-center gap-1.5 rounded-xl py-1 pr-2 pl-1 transition-colors hover:bg-neutral-100",
            open && "bg-neutral-100",
          )}
        >
          <Avatar initials={initials} />
          <ChevronDown
            size={16}
            className={cn("text-muted transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        {open && (
          <div
            id="user-menu-panel"
            className="bg-surface shadow-custom ring-border absolute right-0 mt-2 w-60 overflow-hidden rounded-xl p-1.5 ring-1"
          >
            <div className="px-3 py-2">
              <p className="truncate text-sm font-semibold">{session.user.name}</p>
              <p className="text-muted truncate text-xs">{session.user.email}</p>
            </div>
            <div className="border-border my-1 border-t" />
            <MenuItem href="/nalog" onClick={() => setOpen(false)}>
              <UserRound size={16} aria-hidden="true" /> Moj nalog
            </MenuItem>
            <MenuItem href="/nalog/favoriti" onClick={() => setOpen(false)}>
              <Heart size={16} aria-hidden="true" /> Sačuvani oglasi
            </MenuItem>
            <MenuItem href="/plac" onClick={() => setOpen(false)}>
              <Store size={16} aria-hidden="true" /> Moj autoplac
            </MenuItem>
            {session.user.role === "admin" && (
              <MenuItem href="/admin" onClick={() => setOpen(false)}>
                <ShieldCheck size={16} aria-hidden="true" /> Admin
              </MenuItem>
            )}
            <div className="border-border my-1 border-t" />
            <button
              type="button"
              onClick={logout}
              className="hover:text-foreground flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              <LogOut size={16} aria-hidden="true" /> Odjava
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span
      className="bg-accent-light text-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function MenuItem({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="hover:text-foreground flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
    >
      {children}
    </Link>
  );
}
