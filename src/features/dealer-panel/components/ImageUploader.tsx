"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type UploadedImage = { key: string; url: string; width?: number; height?: number };

interface Props {
  /** Ime skrivenog polja sa JSON listom ključeva. */
  name?: string;
  initial?: UploadedImage[];
  max?: number;
  folder?: "listings" | "dealers";
  /** Za logo: jedna slika. */
  single?: boolean;
}

export default function ImageUploader({
  name = "images",
  initial = [],
  max = 15,
  folder = "listings",
  single = false,
}: Props) {
  const [images, setImages] = useState<UploadedImage[]>(initial);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const limit = single ? 1 : max;

  async function upload(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files).slice(0, limit - images.length);
    if (list.length === 0) {
      setError(`Najviše ${limit} slika`);
      return;
    }
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
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(images.map(({ key, width, height }) => ({ key, width, height })))}
      />

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
        aria-busy={uploading > 0}
        className="border-border text-muted hover:border-foreground focus-within:border-foreground focus-within:ring-accent/30 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-white p-8 text-center text-sm transition-colors focus-within:ring-2"
      >
        {uploading > 0 ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}
        <span>{single ? "Klikni ili prevuci sliku" : `Klikni ili prevuci slike (do ${limit}, prva je naslovna)`}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={!single}
          className="sr-only"
          aria-label={single ? "Izaberi sliku" : "Izaberi slike"}
          onChange={(e) => {
            if (e.target.files) upload(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {error && (
        <p role="alert" className="text-danger text-xs">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <ul className={cn("grid gap-2", single ? "max-w-48 grid-cols-1" : "grid-cols-3 sm:grid-cols-4 md:grid-cols-5")}>
          {images.map((img, i) => (
            <li
              key={img.key}
              className="group border-border relative aspect-[4/3] overflow-hidden rounded-xl border bg-neutral-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={`Slika ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && !single && (
                <span className="bg-foreground absolute top-1.5 left-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Naslovna
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                {!single && (
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    className="text-white disabled:opacity-30"
                    disabled={i === 0}
                    aria-label={`Pomjeri sliku ${i + 1} lijevo`}
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setImages((p) => p.filter((_, k) => k !== i))}
                  className="text-white"
                  aria-label={`Ukloni sliku ${i + 1}`}
                >
                  <Trash2 size={16} />
                </button>
                {!single && (
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    className="text-white disabled:opacity-30"
                    disabled={i === images.length - 1}
                    aria-label={`Pomjeri sliku ${i + 1} desno`}
                  >
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
