import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** true tek poslije hidratacije (za portale i browser-only UI). */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
