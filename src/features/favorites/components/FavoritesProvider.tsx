"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toggleFavorite } from "@/features/favorites/actions";

interface FavoritesCtx {
  ids: ReadonlySet<string>;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => Promise<void>;
}

const Ctx = createContext<FavoritesCtx | null>(null);
const EMPTY: ReadonlySet<string> = new Set();

/**
 * Sačuvani oglasi su per-user, a kartice su u keširanom/statičnom HTML-u, pa se stanje
 * učitava na klijentu jednom po sesiji (GET /api/favorites) i mijenja optimistično.
 * Bez usePathname: u root layoutu bi suspendovao rute sa nepoznatim parametrom (RENDERING.md 11).
 */
export default function FavoritesProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const [ids, setIds] = useState<Set<string>>(() => new Set());

  // Bez sesije se stanje ne briše u efektu nego se samo ne prikazuje (EMPTY); nova prijava ga ponovo učita.
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    fetch("/api/favorites")
      .then((r) => (r.ok ? r.json() : { ids: [] }))
      .then((d: { ids: string[] }) => {
        if (!cancelled) setIds(new Set(d.ids));
      })
      .catch(() => {
        /* bez sačuvanih dok mreža ne proradi */
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  const toggle = useCallback(
    async (id: string) => {
      if (status !== "authenticated") {
        router.push(`/prijava?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      setIds((prev) => {
        const n = new Set(prev);
        if (n.has(id)) n.delete(id);
        else n.add(id);
        return n;
      });
      const res = await toggleFavorite(id);
      if (!res.ok) {
        setIds((prev) => {
          const n = new Set(prev);
          if (n.has(id)) n.delete(id);
          else n.add(id);
          return n;
        });
        if (res.reason === "login")
          router.push(`/prijava?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      setIds((prev) => {
        const n = new Set(prev);
        if (res.favorited) n.add(id);
        else n.delete(id);
        return n;
      });
    },
    [status, router],
  );

  const visible = status === "authenticated" ? ids : EMPTY;
  const value = useMemo<FavoritesCtx>(
    () => ({ ids: visible, isFavorite: (id) => visible.has(id), toggle }),
    [visible, toggle],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavorites() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFavorites mora biti unutar FavoritesProvider");
  return ctx;
}
