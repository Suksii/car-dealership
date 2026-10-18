"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type UploadedImage = { key: string; url: string; width?: number; height?: number };

interface Props {
  name?: string;              // ime skrivenog polja sa JSON listom ključeva
  initial?: UploadedImage[];
  max?: number;
  folder?: "listings" | "dealers";
  single?: boolean;           // za logo: jedna slika
}

export function ImageUploader({ name = "images", initial = [], max = 15, folder = "listings", single = false }: Props) {
  const [images, setImages] = useState<UploadedImage[]>(initial);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const limit = single ? 1 : max;

  async function upload(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files).slice(0, limit - images.length);
    if (list.length === 0) { setError(`Najviše ${limit} slika`); return; }
    setUploading((n) => n + list.length);
    for (const file of list) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Greška pri uploadu");
        setImages((prev) => (single ? [data] : [...prev, data]));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Greška pri uploadu");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function move(i: number, dir: -1 | 1) {
    setImages((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(images.map(({ key, width, height }) => ({ key, width, height })))} />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-white p-6 text-center text-sm text-muted hover:border-accent"
      >
        {uploading > 0 ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        <span>{single ? "Klikni ili prevuci sliku" : `Klikni ili prevuci slike (do ${limit}, prva je naslovna)`}</span>
        <input ref={inputRef} type="file" accept="image/*" multiple={!single} className="hidden"
          onChange={(e) => { if (e.target.files) upload(e.target.files); e.target.value = ""; }} />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}

      {images.length > 0 && (
        <ul className={cn("grid gap-2", single ? "grid-cols-1 max-w-48" : "grid-cols-3 sm:grid-cols-4 md:grid-cols-5")}>
          {images.map((img, i) => (
            <li key={img.key} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              {i === 0 && !single && <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">Naslovna</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!single && <button type="button" onClick={() => move(i, -1)} className="text-white disabled:opacity-30" disabled={i === 0} aria-label="Pomjeri lijevo"><ArrowLeft size={16} /></button>}
                <button type="button" onClick={() => setImages((p) => p.filter((_, k) => k !== i))} className="text-white" aria-label="Ukloni"><Trash2 size={16} /></button>
                {!single && <button type="button" onClick={() => move(i, 1)} className="text-white disabled:opacity-30" disabled={i === images.length - 1} aria-label="Pomjeri desno"><ArrowRight size={16} /></button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
