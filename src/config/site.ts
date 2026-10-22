// Brend i kontakt na jednom mjestu. Nigdje u komponentama ne pisati ime sajta kao literal.
export const SITE = {
  name: "Autivo",
  domain: "autivo.me",
  url: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  tagline: "Polovni automobili iz autoplaceva u Crnoj Gori",
  description: "Pregledaj ponudu svih autoplaceva u Crnoj Gori na jednom mjestu, ili izaberi plac u svom gradu.",
  email: "info@autivo.me",
  locale: "sr-Latn-ME",
  /** Ko stoji iza sajta (impresum, uslovi, privatnost). Ažurirati kad se registruje firma. */
  operator: { name: "Šućo Ramović", city: "Podgorica", country: "Crna Gora" },
  /** Datum važeće verzije uslova i politike privatnosti; promjena datuma = nova verzija. */
  legalUpdatedAt: "2026-10-19",
} as const;
