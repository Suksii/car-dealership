import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** „Provjeren plac": admin je potvrdio firmu (PIB) u registru. `compact` = samo ikona (kartice). */
export default function VerifiedBadge({ compact = false, className }: { compact?: boolean; className?: string }) {
  if (compact) {
    return (
      <span title="Provjeren plac" className={cn("text-success inline-flex shrink-0", className)}>
        <BadgeCheck size={16} aria-hidden="true" />
        <span className="sr-only">Provjeren plac</span>
      </span>
    );
  }
  return (
    <span
      className={cn(
        "bg-success/10 text-success inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
        className,
      )}
    >
      <BadgeCheck size={14} aria-hidden="true" />
      <span>Provjeren plac</span>
    </span>
  );
}
