import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const base = "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:bg-surface";

function Wrap({ label, error, hint, htmlFor, children, className }: { label: string; error?: string; hint?: string; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-fg">{label}</label>
      {children}
      {error ? <p className="text-xs text-danger">{error}</p> : hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function Field({ label, error, hint, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const id = props.id ?? props.name;
  return (
    <Wrap label={label} error={error} hint={hint} htmlFor={id} className={className}>
      <input id={id} {...props} aria-invalid={!!error} className={cn(base, error ? "border-danger" : "border-border")} />
    </Wrap>
  );
}

export function SelectField({ label, error, hint, className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; hint?: string }) {
  const id = props.id ?? props.name;
  return (
    <Wrap label={label} error={error} hint={hint} htmlFor={id} className={className}>
      <select id={id} {...props} aria-invalid={!!error} className={cn(base, "h-[38px]", error ? "border-danger" : "border-border")}>{children}</select>
    </Wrap>
  );
}

export function TextareaField({ label, error, hint, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: string }) {
  const id = props.id ?? props.name;
  return (
    <Wrap label={label} error={error} hint={hint} htmlFor={id} className={className}>
      <textarea id={id} {...props} aria-invalid={!!error} className={cn(base, "min-h-28", error ? "border-danger" : "border-border")} />
    </Wrap>
  );
}

export function SubmitButton({ children, pending, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { pending?: boolean }) {
  return (
    <button type="submit" disabled={pending} {...props}
      className={cn("inline-flex h-10 items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60", className)}>
      {pending ? "Sačekaj..." : children}
    </button>
  );
}
