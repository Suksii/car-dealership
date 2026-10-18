import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { SITE } from "@/config/site";

/** Znak + wordmark. Boje idu iz currentColor i accent tokena, pa radi na svijetloj i tamnoj podlozi. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden="true">
      <rect width="40" height="40" rx="11" className="fill-foreground" />
      {/* put/traka */}
      <path
        d="M8 27.5c6-1.2 8-9.5 12-9.5s6 8.3 12 9.5"
        className="stroke-accent"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* auto silueta */}
      <path
        d="M11.5 23.5l2.2-4.6c.4-.8 1.2-1.4 2.1-1.4h8.4c.9 0 1.7.6 2.1 1.4l2.2 4.6v3.3c0 .5-.4.9-.9.9h-1.3a.9.9 0 0 1-.9-.9v-.6H14.6v.6c0 .5-.4.9-.9.9h-1.3a.9.9 0 0 1-.9-.9z"
        fill="#fff"
      />
      <circle cx="15" cy="24.8" r="1.3" className="fill-foreground" />
      <circle cx="25" cy="24.8" r="1.3" className="fill-foreground" />
    </svg>
  );
}

export default function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label={`${SITE.name} – početna`}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <LogoMark />
      <span className="text-[1.35rem] font-extrabold tracking-tight">
        {SITE.name.toLowerCase()}
        <span className="text-accent">.</span>
      </span>
    </Link>
  );
}
