"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/** Klijentski provideri. Server layout ih omotava oko `children`, pa sam layout ostaje server komponenta. */
export default function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>;
}
