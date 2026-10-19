import type { ReactNode } from "react";
import { SITE } from "@/config/site";
import { formatDate } from "@/lib/utils/format";

/** Okvir za pravne stranice: naslov, datum verzije i tekst sa jednostavnom tipografijom (legal-prose). */
export default function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <article className="container-narrow py-10 md:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
      <p className="text-muted mt-3 text-sm">{`Važi od ${formatDate(SITE.legalUpdatedAt)}. ${intro}`}</p>
      <div className="legal-prose mt-8">{children}</div>
    </article>
  );
}
