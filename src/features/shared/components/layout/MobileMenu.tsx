"use client";

import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { useIsClient } from "@/lib/hooks/useIsClient";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { useKeyboardNav } from "@/lib/hooks/useKeyboardNav";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import ActiveNavLinks from "@/features/shared/components/layout/ActiveNavLinks";

/** Hamburger + panel sa linkovima; `children` je UserMenu koji ulazi kao prop. */
export default function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useBodyScrollLock(open);
  useKeyboardNav({ Escape: close }, { enabled: open });
  useFocusTrap(panelRef, open);
  const isClient = useIsClient();

  return (
    <>
      <button
        type="button"
        aria-label="Otvori meni"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="-m-2 p-2 md:hidden"
      >
        <Menu size={22} aria-hidden="true" />
      </button>
      {isClient &&
        open &&
        createPortal(
          <>
            <div aria-hidden="true" onClick={close} className="anim-fade-in fixed inset-0 z-70 bg-black/40" />
            <div
              ref={panelRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Meni"
              tabIndex={-1}
              className="anim-slide-in-right bg-surface fixed inset-y-2 right-2 z-80 flex w-[min(320px,85vw)] flex-col rounded-2xl p-5 shadow-2xl outline-none"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">Meni</span>
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
