import { useEffect, type RefObject } from "react";

/** Poziva `handler` na klik van `ref` elementa. Aktivno samo dok je `enabled`. */
export function useOutsideClick<T extends HTMLElement>(ref: RefObject<T | null>, handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const listener = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    window.addEventListener("mousedown", listener);
    return () => window.removeEventListener("mousedown", listener);
  }, [ref, handler, enabled]);
}
