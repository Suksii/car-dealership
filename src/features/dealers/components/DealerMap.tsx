import { ExternalLink } from "lucide-react";

/** OpenStreetMap embed bez API ključa + link ka Google mapama. Koordinate su string iz numeric kolone. */
export default function DealerMap({ lat, lng, name }: { lat: string; lng: string; name: string }) {
  const la = Number(lat),
    lo = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return null;
  const bbox = [lo - 0.008, la - 0.005, lo + 0.008, la + 0.005].map((n) => n.toFixed(5)).join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${la},${lo}`;
  return (
    <div className="card overflow-hidden">
      <iframe title={`Mapa: ${name}`} src={src} loading="lazy" className="block h-56 w-full border-0" />
      <a
        href={`https://www.google.com/maps?q=${la},${lo}`}
        target="_blank"
        rel="noopener"
        className="border-border hover:text-accent flex items-center justify-center gap-1.5 border-t px-4 py-2.5 text-sm font-medium"
      >
        <span>Otvori u Google mapama</span>
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </div>
  );
}
