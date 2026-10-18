import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "accent" | "outline";

const VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-surface text-muted",
  success: "bg-success text-white",
  warning: "bg-amber-500 text-white",
  danger: "bg-danger text-white",
  accent: "bg-accent text-white",
  outline: "border border-border text-muted",
};

export function Badge({ variant = "default", className, children }: { variant?: BadgeVariant; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold", VARIANTS[variant], className)}>
      {children}
    </span>
  );
}
