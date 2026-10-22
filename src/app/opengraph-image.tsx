import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "@/config/site";

export const alt = `${SITE.name} – ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Podrazumijevana OG slika (naslovna, lista, placevi). Oglasi imaju svoju fotografiju. */
export default async function OpenGraphImage() {
  // Bijela verzija cijelog loga na tamnoj podlozi, kao data URI (Satori ne učitava relativne putanje).
  const png = await readFile(path.join(process.cwd(), "public/logo-light.png"));
  const logo = `data:image/png;base64,${png.toString("base64")}`;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#111318",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={logo} alt="" width={416} height={120} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 900 }}>
          Auto sa placa, bez obilaska placeva.
        </div>
        <div style={{ fontSize: 30, color: "rgba(255,255,255,0.7)" }}>{SITE.tagline}</div>
      </div>
    </div>,
    size,
  );
}
