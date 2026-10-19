"use client";

import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useIsClient } from "@/lib/hooks/useIsClient";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { useKeyboardNav } from "@/lib/hooks/useKeyboardNav";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { usePresence } from "@/lib/hooks/usePresence";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  label: string;
  maxWidth?: string;
  children: ReactNode;
}

/** Dijalog preko portala: fokus ulazi i kruži unutra, Esc i klik na pozadinu zatvaraju, fokus se vraća. */
export default function Modal({ open, onClose, label, maxWidth = "max-w-2xl", children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useBodyScrollLock(open);
  useKeyboardNav({ Escape: onClose }, { enabled: open });
  useFocusTrap(panelRef, open);
  const isClient = useIsClient();
  const { mounted, closing } = usePresence(open);
  if (!isClient || !mounted) return null;

  return createPortal(
    <>
      <div
        aria-hidden="true"
        className={cn("fixed inset-0 z-70 bg-black/50", closing ? "anim-fade-out" : "anim-fade-in")}
      />
      <div onClick={onClose} className="fixed inset-0 z-80 flex items-center justify-center p-4">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          inert={closing}
          className={cn(
            "relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl outline-none",
            maxWidth,
            closing ? "anim-pop-out" : "anim-pop-in",
          )}
        >
          <button
            type="button"
            aria-label="Zatvori"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 grid h-9 w-9 place-content-center rounded-full bg-white/90 shadow transition-colors hover:bg-neutral-100"
          >
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </button>
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}
