/** PIB pravnog lica i preduzetnika u Crnoj Gori ima 8 cifara. Razmaci, tačke i crtice iz unosa se uklanjaju. */
export function normalizeTaxId(raw: string | null | undefined): string | null {
  const digits = (raw ?? "").replace(/[\s.\-]/g, "");
  return /^\d{8}$/.test(digits) ? digits : null;
}

/** Javna pretraga privrednih subjekata (CRPS), za ručnu provjeru prije odobrenja placa. */
export const CRPS_SEARCH_URL = "https://www.crps.me/";
