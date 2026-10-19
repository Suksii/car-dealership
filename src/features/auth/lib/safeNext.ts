/** Samo relativna putanja na istom sajtu; "//", "/\" i šeme vode na /nalog (open redirect). */
export function safeNextPath(value: unknown): string {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s.startsWith("/") || /^\/[\/\\]/.test(s) || /[\r\n]/.test(s)) return "/nalog";
  return s;
}
