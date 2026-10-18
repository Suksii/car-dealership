"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useIsClient } from "@/lib/hooks/useIsClient";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { useKeyboardNav } from "@/lib/hooks/useKeyboardNav";
import { fadeIn } from "@/lib/motion/variants";
import ActiveNavLinks from "@/features/shared/components/layout/ActiveNavLinks";

/** Hamburger + panel sa linkovima; `children` je UserMenu (server sadržaj) koji ulazi kao prop. */
export default function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  useBodyScrollLock(open);
  useKeyboardNav({ Escape: close }, { enabled: open });
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
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  key="backdrop"
                  aria-hidden="true"
                  onClick={close}
                  className="fixed inset-0 z-70 bg-black/40"
                  {...fadeIn}
                />
                <motion.div
                  key="panel"
                  id="mobile-menu"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Meni"
                  className="bg-surface fixed inset-y-2 right-2 z-80 flex w-[min(320px,85vw)] flex-col rounded-2xl p-5 shadow-2xl"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 400, damping: 40 }}
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
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
