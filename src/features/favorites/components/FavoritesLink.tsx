"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/features/favorites/components/FavoritesProvider";
import { cn } from "@/lib/utils/cn";

/** Srce u headeru sa brojem sačuvanih; gost klikom stiže na prijavu (ruta je zaštićena). */
export default function FavoritesLink({ className }: { className?: string }) {
  const { ids } = useFavorites();
  const n = ids.size;
  return (
    <Link
      href="/nalog/favoriti"
      aria-label={n > 0 ? `Sačuvani oglasi (${n})` : "Sačuvani oglasi"}
      title="Sačuvani oglasi"
      className={cn(
        "text-foreground relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-neutral-100",
        className,
      )}
    >
      <Heart size={20} aria-hidden="true" />
      {n > 0 && (
        <span
          aria-hidden="true"
          className="bg-accent absolute top-0.5 right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-xs leading-none font-bold text-white"
        >
          {n > 99 ? "99+" : n}
        </span>
      )}
    </Link>
  );
}
