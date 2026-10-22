import { SITE } from "@/config/site";

/** Bezbjedno ubacivanje korisničkog teksta u HTML emaila. */
export function escapeHtml(v: string): string {
  return v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

const ACCENT = "#c94d0a";
const DARK = "#111318";
const MUTED = "#646a78";

/**
 * Jednostavan raspored koji radi u svim klijentima: tabela, inline stilovi, bez slika osim loga.
 * `preheader` je sivi pregled pored naslova u inboxu; `fallbackLink` ispisuje link kao tekst ispod dugmeta.
 */
function layout(
  title: string,
  body: string,
  opts: { button?: { href: string; label: string }; preheader?: string; fallbackLink?: boolean } = {},
) {
  const { button, preheader, fallbackLink } = opts;
  const btn = button
    ? `<p style="margin:28px 0 12px"><a href="${escapeHtml(button.href)}" style="background:${DARK};color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:12px;display:inline-block">${escapeHtml(button.label)}</a></p>` +
      (fallbackLink
        ? `<p style="font-size:12px;color:${MUTED};margin:0 0 8px">Ako dugme ne radi, kopiraj ovaj link u browser:<br><a href="${escapeHtml(button.href)}" style="color:${MUTED};word-break:break-all">${escapeHtml(button.href)}</a></p>`
        : "")
    : "";
  const pre = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(preheader)}</div>`
    : "";
  return `<!doctype html><html lang="sr"><body style="margin:0;background:#f5f5f6;font-family:Arial,Helvetica,sans-serif;color:${DARK}">${pre}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f6;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:16px;padding:32px">
<tr><td>
<p style="margin:0 0 24px"><img src="${SITE.url}/logo.png" alt="${escapeHtml(SITE.name)}" height="32" style="height:32px"></p>
<h1 style="font-size:22px;line-height:1.3;margin:0 0 12px">${escapeHtml(title)}</h1>
<div style="font-size:15px;line-height:1.6">${body}</div>
${btn}
<p style="font-size:12px;color:${MUTED};margin:28px 0 0;border-top:1px solid #eee;padding-top:16px">${escapeHtml(SITE.name)} · ${escapeHtml(SITE.tagline)}</p>
</td></tr></table></td></tr></table></body></html>`;
}

export function passwordResetEmail(name: string, link: string, minutes: number) {
  const subject = `Promjena lozinke na ${SITE.name}`;
  const html = layout(
    "Postavi novu lozinku",
    `<p>Zdravo ${escapeHtml(name)},</p><p>stigao je zahtjev za novu lozinku za tvoj nalog. Link važi ${minutes} minuta i može se iskoristiti jednom.</p><p style="color:${MUTED};font-size:13px">Ako zahtjev nije bio tvoj, ignoriši ovu poruku. Lozinka ostaje ista.</p>`,
    {
      button: { href: link, label: "Postavi novu lozinku" },
      preheader: `Link za novu lozinku važi ${minutes} minuta.`,
      fallbackLink: true,
    },
  );
  const text = `Zdravo ${name},\n\nstigao je zahtjev za novu lozinku za tvoj nalog na sajtu ${SITE.name}.\nLink (važi ${minutes} minuta):\n${link}\n\nAko zahtjev nije bio tvoj, ignoriši ovu poruku. Lozinka ostaje ista.`;
  return { subject, html, text };
}

export function verifyEmailEmail(name: string, link: string, hours: number) {
  const subject = `Potvrdi email za ${SITE.name}`;
  const html = layout(
    "Potvrdi email adresu",
    `<p>Zdravo ${escapeHtml(name)},</p><p>hvala na registraciji. Potvrdi da je ovo tvoja email adresa, da bi ti stizala obavještenja i da bi mogao/la da registruješ autoplac. Link važi ${hours} sata.</p><p style="color:${MUTED};font-size:13px">Ako nisi pravio/la nalog, ignoriši ovu poruku.</p>`,
    {
      button: { href: link, label: "Potvrdi email" },
      preheader: "Još jedan klik i nalog je spreman.",
      fallbackLink: true,
    },
  );
  const text = `Zdravo ${name},\n\nhvala na registraciji na sajtu ${SITE.name}. Potvrdi email adresu (link važi ${hours} sata):\n${link}\n\nAko nisi pravio/la nalog, ignoriši ovu poruku.`;
  return { subject, html, text };
}

export function newDealerEmail(d: {
  name: string;
  city: string;
  phone: string;
  ownerEmail: string;
  taxId: string | null;
}) {
  const subject = `Novi plac čeka odobrenje: ${d.name}`;
  const rows = [
    ["Plac", d.name],
    ["Grad", d.city],
    ["Telefon", d.phone],
    ["Vlasnik", d.ownerEmail],
    ["PIB", d.taxId ?? "nije unesen"],
  ];
  const html = layout(
    "Novi plac čeka odobrenje",
    `<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px">${rows
      .map(
        ([k, v]) =>
          `<tr><td style="color:${MUTED};padding:3px 16px 3px 0">${k}</td><td style="font-weight:600">${escapeHtml(v)}</td></tr>`,
      )
      .join("")}</table>`,
    { button: { href: `${SITE.url}/admin`, label: "Otvori admin" } },
  );
  const text = `Novi plac čeka odobrenje:\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${SITE.url}/admin`;
  return { subject, html, text };
}

export function newReportEmail(r: {
  listingTitle: string;
  listingUrl: string;
  reason: string;
  message: string | null;
}) {
  const subject = `Prijava oglasa: ${r.listingTitle}`;
  const html = layout(
    "Novi oglas je prijavljen",
    `<p><a href="${escapeHtml(r.listingUrl)}" style="color:${ACCENT};font-weight:700">${escapeHtml(r.listingTitle)}</a></p><p><strong>Razlog:</strong> ${escapeHtml(r.reason)}</p>${r.message ? `<p style="white-space:pre-line">${escapeHtml(r.message)}</p>` : ""}`,
    { button: { href: `${SITE.url}/admin/prijave`, label: "Pregledaj prijave" } },
  );
  const text = `Prijava oglasa: ${r.listingTitle}\n${r.listingUrl}\nRazlog: ${r.reason}\n${r.message ?? ""}\n\n${SITE.url}/admin/prijave`;
  return { subject, html, text };
}
