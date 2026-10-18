// Brend i kontakt na jednom mjestu. Nigdje u komponentama ne pisati ime sajta kao literal.
export const SITE = {
  name: "Autoplac",
  domain: "autoplac.me",
  url: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  tagline: "Polovni automobili iz autoplaceva u Crnoj Gori",
  description: "Pregledaj ponudu svih autoplaceva u Crnoj Gori na jednom mjestu, ili izaberi plac u svom gradu.",
  email: "info@autoplac.me",
  locale: "sr-Latn-ME",
} as const;
