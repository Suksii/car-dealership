import { useEffect, useState } from "react";

const EXIT_MS = 200;

/**
 * Drži element montiran još malo poslije zatvaranja da izlazna CSS animacija stigne
 * da se odigra (zamjena za AnimatePresence bez framer-motion-a).
 * `mounted` kaže da li renderovati, `closing` koju klasu dati (anim-*-out).
 * Uz `prefers-reduced-motion` element nestaje odmah.
 */
export function usePresence(open: boolean, duration = EXIT_MS): { mounted: boolean; closing: boolean } {
  const [closing, setClosing] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    setClosing(!open);
  }
  useEffect(() => {
    if (!closing) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setClosing(false), reduce ? 0 : duration);
    return () => window.clearTimeout(t);
  }, [closing, duration]);
  return { mounted: open || closing, closing };
}
