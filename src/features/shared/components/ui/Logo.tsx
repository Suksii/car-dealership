import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { SITE } from "@/config/site";

/** PNG fajlovi u public/: cijeli logo (znak + ime) i sam znak; visina zadaje širinu preko odnosa stranica. */
const LOGO_RATIO = 1562 / 451;
const MARK_RATIO = 576 / 423;

type MarkProps = { className?: string; size?: number; light?: boolean; priority?: boolean };

/** Samo znak „A sa putem" (mobilni meni, mjesta gdje nema prostora za ime). `light` za tamnu podlogu. */
export function LogoMark({ className, size = 36, light = false, priority = false }: MarkProps) {
  return (
    <Image
      src={light ? "/logo-mark-light.png" : "/logo-mark.png"}
      alt=""
      aria-hidden="true"
      width={Math.round(size * MARK_RATIO)}
      height={size}
      priority={priority}
      className={cn("shrink-0", className)}
    />
  );
}

/** Cijeli logo (znak + ime) kao link na početnu; ime nosi aria-label. Izvor i pravila: docs/DESIGN.md, „Logo". */
export default function Logo({
  className,
  href = "/",
  size = 34,
  light = false,
}: Omit<MarkProps, "priority"> & { href?: string }) {
  return (
    <Link href={href} aria-label={`${SITE.name} – početna`} className={cn("inline-flex items-center", className)}>
      <Image
        src={light ? "/logo-light.png" : "/logo.png"}
        alt=""
        aria-hidden="true"
        width={Math.round(size * LOGO_RATIO)}
        height={size}
        priority
        className="shrink-0"
      />
    </Link>
  );
}
