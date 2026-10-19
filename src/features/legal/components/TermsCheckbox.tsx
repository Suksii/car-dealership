import Link from "next/link";
import Checkbox from "@/features/shared/components/ui/Checkbox";

/** Prihvatanje uslova na registraciji naloga i placa; datum prihvatanja se upisuje u bazu. */
export default function TermsCheckbox({ variant = "user", error }: { variant?: "user" | "dealer"; error?: string }) {
  const label = (
    <span>
      Prihvatam{" "}
      <Link href="/uslovi" target="_blank" className="hover:text-accent font-medium underline">
        uslove korišćenja
      </Link>
      {variant === "dealer" ? " uključujući dio za autoplaceve" : ""} i{" "}
      <Link href="/privatnost" target="_blank" className="hover:text-accent font-medium underline">
        politiku privatnosti
      </Link>
    </span>
  );
  return (
    <div className="flex flex-col gap-1.5">
      <Checkbox
        name="terms"
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "terms-error" : undefined}
        label={label}
        className="items-start"
      />
      {error && (
        <p id="terms-error" role="alert" className="text-danger text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
