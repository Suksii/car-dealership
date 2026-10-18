"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  name?: string;
  value?: string;
  checked: boolean;
  onChange: () => void;
  label?: React.ReactNode;
  className?: string;
}

export function Checkbox({ name, value, checked, onChange, label, className }: CheckboxProps) {
  return (
    <label className={cn("flex items-center gap-2.5 cursor-pointer group select-none", className)}>
      <input type="checkbox" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <div className={cn(
        "h-[17px] w-[17px] rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-150",
        checked ? "bg-accent border-accent" : "border-border bg-white group-hover:border-accent",
      )}>
        {checked && <Check size={10} strokeWidth={3.5} className="text-white" />}
      </div>
      {label !== undefined && <span className="text-sm leading-none transition-colors group-hover:text-accent">{label}</span>}
    </label>
  );
}
