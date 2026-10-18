import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export default function SectionHeader({
  title,
  eyebrow,
  action,
  className,
  as: Tag = "h2",
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <p className="eyebrow text-muted mb-1">{eyebrow}</p>}
        <Tag className={cn("font-bold tracking-tight", Tag === "h1" ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl")}>
          {title}
        </Tag>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
