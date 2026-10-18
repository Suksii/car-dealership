import { useCallback, useState } from "react";

export function useToggle(initial = false) {
  const [open, setOpen] = useState(initial);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  return { open, toggle, set: setOpen } as const;
}
