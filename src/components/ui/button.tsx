import { type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent hover:bg-accent-hover text-white disabled:opacity-50",
  secondary: "bg-fg text-white hover:opacity-80 disabled:opacity-50",
  outline: "border border-border bg-white hover:border-accent hover:text-accent disabled:opacity-50",
  ghost: "hover:bg-surface disabled:opacity-50",
  danger: "bg-danger text-white hover:opacity-80 disabled:opacity-50",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-8 text-sm",
  icon: "h-10 w-10",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  href?: string;
  children?: ReactNode;
}

export function Button({ variant = "primary", size = "md", fullWidth, href, className, children, ...props }: ButtonProps) {
  const base = cn(
    "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 cursor-pointer select-none disabled:cursor-not-allowed",
    VARIANTS[variant], SIZES[size], fullWidth && "w-full", className,
  );
  if (href) return <Link href={href} className={base}>{children}</Link>;
  return <button className={base} {...props}>{children}</button>;
}
