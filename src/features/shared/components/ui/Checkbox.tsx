import { Check } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
}

export default function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn("group flex cursor-pointer items-center gap-2.5 select-none", className)}>
      <span className="relative flex-none">
        <input type="checkbox" className="peer sr-only" {...props} />
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border border-border bg-white transition-colors group-hover:border-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-accent/30">
          <Check size={11} strokeWidth={3} className="text-white" aria-hidden="true" />
        </span>
      </span>
      {label !== undefined && <span className="text-sm leading-none">{label}</span>}
    </label>
  );
}
