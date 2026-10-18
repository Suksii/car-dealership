"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useIsClient } from "@/lib/hooks/useIsClient";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { useKeyboardNav } from "@/lib/hooks/useKeyboardNav";
import { fadeIn, popIn } from "@/lib/motion/variants";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  label: string;
  maxWidth?: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, label, maxWidth = "max-w-2xl", children }: ModalProps) {
  useBodyScrollLock(open);
  useKeyboardNav({ Escape: onClose }, { enabled: open });
  const isClient = useIsClient();
  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="backdrop" aria-hidden="true" className="fixed inset-0 z-70 bg-black/50" {...fadeIn} />
          <div onClick={onClose} className="fixed inset-0 z-80 flex items-center justify-center p-4">
            <motion.div
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label={label}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full ${maxWidth} overflow-hidden rounded-2xl bg-white shadow-2xl`}
              {...popIn}
            >
              <button
                type="button"
                aria-label="Zatvori"
                onClick={onClose}
                className="absolute top-3 right-3 z-10 grid h-9 w-9 place-content-center rounded-full bg-white/90 shadow transition-colors hover:bg-neutral-100"
              >
                <X size={16} strokeWidth={2} />
              </button>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
