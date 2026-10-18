import { type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "viber" | "whatsapp";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-foreground text-white shadow-xs hover:bg-neutral-800",
  secondary: "bg-accent text-white shadow-xs hover:bg-accent-hover",
  outline: "border border-border bg-surface text-foreground shadow-xs hover:border-neutral-400 hover:bg-neutral-50",
  ghost: "text-foreground hover:bg-neutral-100",
  danger: "bg-danger text-white shadow-xs hover:opacity-90",
  viber: "bg-viber text-white shadow-xs hover:bg-viber-hover",
  whatsapp: "bg-whatsapp text-white shadow-xs hover:bg-whatsapp-hover",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
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

/**
 * primary = tamno (glavna akcija svuda), secondary = accent (jedan naglašeni CTA po ekranu),
 * viber/whatsapp = boje brendova. Zaobljenje prati polja forme (rounded-xl).
 */
export default function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const base = cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap select-none",
    "transition-[background-color,border-color,opacity,transform] duration-150 active:translate-y-px",
    "outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );
  if (href)
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  return (
    <button className={base} {...props}>
      {children}
    </button>
  );
}
export type { ButtonVariant, ButtonSize };
