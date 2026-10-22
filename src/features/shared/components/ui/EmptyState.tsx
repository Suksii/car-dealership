import type { ReactNode } from "react";
import { LogoMark } from "@/features/shared/components/ui/Logo";
import { cn } from "@/lib/utils/cn";

interface Props {
  /** Poruka; ide u svoj <p>. */
  children: ReactNode;
  /** Dugme ili link ispod poruke. */
  action?: ReactNode;
  className?: string;
}

/** Prazno stanje liste: blijedi znak iznad poruke, isprekidan okvir. */
export default function EmptyState({ children, action, className }: Props) {
  return (
    <div
      className={cn(
        "border-border bg-surface flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      <LogoMark size={44} className="opacity-15 grayscale" />
      <p className="text-muted max-w-sm text-sm">{children}</p>
      {action}
    </div>
  );
}
