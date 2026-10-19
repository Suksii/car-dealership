import { ImageResponse } from "next/og";
import { SITE } from "@/config/site";

export const alt = `${SITE.name} – ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Podrazumijevana OG slika (naslovna, lista, placevi). Oglasi imaju svoju fotografiju. */
export default function OpenGraphImage() {
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
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "#e8590c" }} />
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2 }}>{`${SITE.name.toLowerCase()}.`}</div>
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
