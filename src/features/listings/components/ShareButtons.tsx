"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { ViberIcon, WhatsAppIcon } from "@/features/shared/components/ui/BrandIcons";

interface Props {
  url: string;
  title: string;
}

const btn =
  "border-border hover:border-foreground flex h-9 w-9 items-center justify-center rounded-full border bg-white transition-colors";

/** Dijeljenje oglasa: Viber, WhatsApp, kopiranje linka i sistemsko dijeljenje na telefonu. */
export default function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(`${title} ${url}`);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Kopiraj link:", url);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // korisnik je zatvorio dijalog za dijeljenje; nema šta da se radi
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted mr-1 text-xs font-semibold">Podijeli</span>
      <a href={`viber://forward?text=${text}`} aria-label="Podijeli preko Vibera" className={`${btn} text-viber`}>
        <ViberIcon className="size-4" />
      </a>
      <a
        href={`https://wa.me/?text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Podijeli preko WhatsAppa"
        className={`${btn} text-whatsapp`}
      >
        <WhatsAppIcon className="size-4" />
      </a>
      <button type="button" onClick={copy} aria-label={copied ? "Link kopiran" : "Kopiraj link"} className={btn}>
        {copied ? (
          <Check size={16} className="text-success" aria-hidden="true" />
        ) : (
          <Link2 size={16} aria-hidden="true" />
        )}
      </button>
      <button type="button" onClick={nativeShare} aria-label="Podijeli" className={`${btn} md:hidden`}>
        <Share2 size={16} aria-hidden="true" />
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Link kopiran" : ""}
      </span>
    </div>
  );
}
