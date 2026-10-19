"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/features/favorites/components/FavoritesProvider";
import { cn } from "@/lib/utils/cn";

export default function FavoriteButton({
  listingId,
  className,
  size = 18,
}: {
  listingId: string;
  className?: string;
  size?: number;
}) {
  const { isFavorite, toggle } = useFavorites();
  const on = isFavorite(listingId);
  const [pop, setPop] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Ukloni iz sačuvanih" : "Sačuvaj oglas"}
      title={on ? "Ukloni iz sačuvanih" : "Sačuvaj oglas"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!on) setPop(true);
        void toggle(listingId);
      }}
      className={cn(
        "text-foreground relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-xs backdrop-blur transition-[background-color,transform] hover:bg-white active:scale-95",
        on && "text-danger",
        className,
      )}
    >
      <Heart
        size={size}
        className={cn(on && "fill-current", pop && "anim-heart-pop")}
        onAnimationEnd={() => setPop(false)}
        aria-hidden="true"
      />
    </button>
  );
}
