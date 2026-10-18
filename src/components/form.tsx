import type { InputHTMLAttributes } from "react";

export function Field({
  label, error, ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const id = props.id ?? props.name;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700">{label}</label>
      <input
        id={id}
        {...props}
        aria-invalid={!!error}
        className={`rounded-md border px-3 py-2 text-base outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-zinc-300"}`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function SubmitButton({ children, pending }: { children: React.ReactNode; pending?: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
    >
      {pending ? "Sačekaj..." : children}
    </button>
  );
}
