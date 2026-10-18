import { type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary: "bg-foreground text-white hover:opacity-85",
  outline: "border border-border bg-white hover:border-foreground",
  ghost: "hover:bg-neutral-100",
  danger: "bg-danger text-white hover:opacity-85",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-sm",
  icon: "h-10 w-10",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Renderuje se kao next/link. */
  href?: string;
  children?: ReactNode;
}

export default function Button({ variant = "primary", size = "md", fullWidth, href, className, children, ...props }: ButtonProps) {
  const base = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,border-color,opacity] duration-150 cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-40",
    VARIANTS[variant], SIZES[size], fullWidth && "w-full", className,
  );
  if (href) return <Link href={href} className={base}>{children}</Link>;
  return <button className={base} {...props}>{children}</button>;
}
export type { ButtonVariant, ButtonSize };
