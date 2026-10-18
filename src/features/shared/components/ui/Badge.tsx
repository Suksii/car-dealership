import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "accent" | "outline" | "dark";

const VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-neutral-100 text-neutral-600",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-amber-700",
  danger: "bg-danger/10 text-danger",
  accent: "bg-accent/10 text-accent",
  outline: "border border-border text-muted",
  dark: "bg-foreground text-white",
};

export default function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
