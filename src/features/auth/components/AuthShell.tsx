import type { ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { LogoMark } from "@/features/shared/components/ui/Logo";

interface Props {
  title: string;
  subtitle: string;
  /** Prednosti naloga u tamnom panelu (desktop). */
  points: readonly string[];
  children: ReactNode;
}

/**
 * Okvir za prijavu i registraciju: forma lijevo, na desktopu tamni panel desno sa velikim
 * blijedim znakom i kratkim „zašto nalog". Na telefonu samo forma, sa malim znakom iznad naslova.
 */
export default function AuthShell({ title, subtitle, points, children }: Props) {
  return (
    <div className="container-page py-8 md:py-14">
      <div className="bg-surface shadow-card ring-border mx-auto grid max-w-5xl overflow-hidden rounded-3xl ring-1 lg:grid-cols-[1fr_0.9fr]">
        <div className="flex flex-col gap-6 p-6 sm:p-10">
          <div className="flex flex-col gap-2">
            <LogoMark size={36} className="mb-2 lg:hidden" />
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            <p className="text-muted text-sm">{subtitle}</p>
          </div>
          {children}
        </div>

        <aside className="bg-foreground relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
          {/* Veliki blijedi znak, isječen ivicom panela; samo ukras. */}
          <LogoMark light size={420} className="pointer-events-none absolute -right-24 -bottom-16 opacity-10" />
          <Link href="/" aria-label="Početna" className="relative w-fit">
            <LogoMark light size={40} />
          </Link>
          <div className="relative flex flex-col gap-5">
            <p className="text-2xl leading-snug font-extrabold tracking-tight">
              Ponuda svih placeva u Crnoj Gori, na jednom mjestu.
            </p>
            <ul className="flex flex-col gap-3 text-sm text-white/80">
              {points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="bg-accent mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
