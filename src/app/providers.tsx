"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import FavoritesProvider from "@/features/favorites/components/FavoritesProvider";

/** Klijentski provideri. Server layout ih omotava oko `children`, pa sam layout ostaje server komponenta. */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <FavoritesProvider>{children}</FavoritesProvider>
    </SessionProvider>
  );
}
