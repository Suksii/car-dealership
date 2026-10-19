"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useKeyboardNav } from "@/lib/hooks/useKeyboardNav";
import { cn } from "@/lib/utils/cn";

type Img = { full: string; thumb: string };

export default function Gallery({ images, alt }: { images: Img[]; alt: string }) {
  const [i, setI] = useState(0);
  const [prevI, setPrevI] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(true);
  const go = (k: number) => {
    if (k === i) return;
    setPrevI(i);
    setLoaded(false);
    setI(k);
  };
  const prev = () => go((i - 1 + images.length) % images.length);
  const next = () => go((i + 1) % images.length);
  useKeyboardNav({ ArrowLeft: prev, ArrowRight: next }, { enabled: images.length > 1 });

  if (images.length === 0) {
    return (
      <div className="text-muted flex aspect-4/3 items-center justify-center rounded-2xl bg-neutral-100">
        Bez slika
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-neutral-100">
        {prevI !== null && prevI !== i && (
          <Image
            key={`prev-${images[prevI].full}`}
            src={images[prevI].full}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
            aria-hidden="true"
          />
        )}
        <Image
          key={images[i].full}
          src={images[i].full}
          alt={`${alt} – slika ${i + 1}`}
          fill
          priority={i === 0}
          sizes="(max-width: 1024px) 100vw, 60vw"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          onAnimationEnd={() => setPrevI(null)}
          className={cn("object-cover", loaded ? "anim-img-in" : "opacity-0")}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Prethodna slika"
              className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-opacity hover:bg-white md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Sljedeća slika"
              className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-opacity hover:bg-white md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
            <span
              aria-live="polite"
              className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white"
            >
              {i + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <ul className="scrollbar-hide flex gap-2 overflow-x-auto">
          {images.map((img, k) => (
            <li key={img.thumb} className="shrink-0">
              <button
                type="button"
                onClick={() => go(k)}
                aria-label={`Slika ${k + 1}`}
                aria-current={k === i}
                className={cn(
                  "relative h-16 w-22 overflow-hidden rounded-lg border-2 transition-colors",
                  k === i ? "border-foreground" : "border-transparent hover:border-neutral-300",
                )}
              >
                <Image src={img.thumb} alt="" fill sizes="88px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
