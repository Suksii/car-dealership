"use client";

import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { useIsClient } from "@/lib/hooks/useIsClient";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { useKeyboardNav } from "@/lib/hooks/useKeyboardNav";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { usePresence } from "@/lib/hooks/usePresence";
import { cn } from "@/lib/utils/cn";
import ActiveNavLinks from "@/features/shared/components/layout/ActiveNavLinks";
import { LogoMark } from "@/features/shared/components/ui/Logo";

/** Hamburger + panel sa linkovima; `children` je UserMenu koji ulazi kao prop. */
export default function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useBodyScrollLock(open);
  useKeyboardNav({ Escape: close }, { enabled: open });
  useFocusTrap(panelRef, open);
  const isClient = useIsClient();
  const { mounted, closing } = usePresence(open);

  return (
    <>
      <button
        type="button"
        aria-label="Otvori meni"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 md:hidden"
      >
        <Menu size={22} aria-hidden="true" />
      </button>
      {isClient &&
        mounted &&
        createPortal(
          <>
            <div
              aria-hidden="true"
              onClick={close}
              className={cn("fixed inset-0 z-70 bg-black/40", closing ? "anim-fade-out" : "anim-fade-in")}
            />
            <div
              ref={panelRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Meni"
              tabIndex={-1}
              inert={closing}
              className={cn(
                "bg-surface fixed inset-y-2 right-2 z-80 flex w-[min(320px,85vw)] flex-col rounded-2xl p-5 shadow-2xl outline-none",
                closing ? "anim-slide-out-right" : "anim-slide-in-right",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-bold">
                  <LogoMark size={26} />
                  <span>Meni</span>
                </span>
                <button type="button" aria-label="Zatvori" onClick={close} className="-m-2 p-2">
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <nav className="mt-6" aria-label="Mobilna navigacija">
                <ActiveNavLinks stacked onNavigate={close} />
              </nav>
              <div className="border-border mt-auto border-t pt-5" onClick={close}>
                {children}
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
