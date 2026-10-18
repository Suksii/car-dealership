import { useEffect, useRef, type RefObject } from "react";

type KeyMap = Partial<Record<string, () => void>>;

/** Mapira tastere na handlere, npr. useKeyboardNav({ Escape: onClose }, { enabled: open }). */
export function useKeyboardNav(keyMap: KeyMap, options: { target?: RefObject<HTMLElement | null>; enabled?: boolean } = {}) {
  const { target, enabled = true } = options;
  const keyMapRef = useRef(keyMap);

  useEffect(() => {
    keyMapRef.current = keyMap;
  });

  useEffect(() => {
    if (!enabled) return;
    const el = (target?.current ?? window) as EventTarget;
    const onKey = (e: KeyboardEvent) => keyMapRef.current[e.key]?.();
    el.addEventListener("keydown", onKey as EventListener);
    return () => el.removeEventListener("keydown", onKey as EventListener);
  }, [enabled, target]);
}
