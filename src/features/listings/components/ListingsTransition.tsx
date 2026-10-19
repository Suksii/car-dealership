"use client";

import { createContext, useContext, useTransition, type ReactNode, type TransitionStartFunction } from "react";
import { cn } from "@/lib/utils/cn";

type Ctx = { pending: boolean; startTransition: TransitionStartFunction };

const ListingsTransitionCtx = createContext<Ctx | null>(null);

export function ListingsTransitionProvider({ children }: { children: ReactNode }) {
  const [pending, startTransition] = useTransition();
  return (
    <ListingsTransitionCtx.Provider value={{ pending, startTransition }}>{children}</ListingsTransitionCtx.Provider>
  );
}

export function useListingsTransition(): Ctx {
  const ctx = useContext(ListingsTransitionCtx);
  const [pending, startTransition] = useTransition();
  return ctx ?? { pending, startTransition };
}

export function ListingsPendingDim({ children, className }: { children: ReactNode; className?: string }) {
  const { pending } = useListingsTransition();
  return (
    <div
      aria-busy={pending}
      className={cn("transition-opacity duration-200", pending && "pointer-events-none opacity-50", className)}
    >
      {children}
    </div>
  );
}
