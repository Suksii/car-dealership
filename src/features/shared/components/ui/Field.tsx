import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function FieldWrap({
  label,
  error,
  hint,
  htmlFor,
  children,
  className,
  required,
}: {
  label: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {required && (
          <span className="text-danger ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={htmlFor ? `${htmlFor}-hint` : undefined} className="text-muted text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** id poruke o grešci ili hinta, da čitač ekrana pročita tekst ispod polja. */
export function describedBy(id: string | undefined, error?: string, hint?: string) {
  if (!id) return undefined;
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string };

export function Field({ label, error, hint, className, ...props }: FieldProps) {
  const id = props.id ?? props.name;
  return (
    <FieldWrap label={label} error={error} hint={hint} htmlFor={id} className={className} required={props.required}>
      <input
        id={id}
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn("field-control", error && "field-control-error")}
      />
    </FieldWrap>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: string };

export function TextareaField({ label, error, hint, className, ...props }: TextareaProps) {
  const id = props.id ?? props.name;
  return (
    <FieldWrap label={label} error={error} hint={hint} htmlFor={id} className={className} required={props.required}>
      <textarea
        id={id}
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn("field-control min-h-32 py-3", error && "field-control-error")}
      />
    </FieldWrap>
  );
}

export function SubmitButton({
  children,
  pending,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { pending?: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      {...props}
      className={cn(
        "bg-foreground inline-flex h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {pending ? "Sačekaj…" : children}
    </button>
  );
}
