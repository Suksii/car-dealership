"use client";

import { usePathname } from "next/navigation";
import NavLinks from "@/features/shared/components/layout/NavLinks";

/**
 * usePathname suspenduje na rutama sa nepoznatim dinamičkim parametrom (cacheComponents),
 * pa se u headeru renderuje pod <Suspense fallback={<NavLinks />}> (docs/RENDERING.md, pravilo 11).
 */
export default function ActiveNavLinks(props: { stacked?: boolean; onNavigate?: () => void }) {
  return <NavLinks pathname={usePathname()} {...props} />;
}
