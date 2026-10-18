/** "Škoda Octavia 2.0 TDI" -> "skoda-octavia-2-0-tdi" (naša slova -> ASCII). */
export function slugify(str: string): string {
  return str
    .replace(/đ/g, "dj").replace(/Đ/g, "dj")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
