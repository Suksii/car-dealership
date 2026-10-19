import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, imageUrl, processAndStoreImage } from "@/lib/images";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Nisi prijavljen" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const folder = form.get("folder") === "dealers" ? "dealers" : "listings";
  if (!(file instanceof File)) return NextResponse.json({ error: "Nema fajla" }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Slika je veća od 12 MB" }, { status: 413 });
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    return NextResponse.json({ error: "Dozvoljeni su JPG, PNG, WebP i HEIC" }, { status: 415 });

  try {
    const result = await processAndStoreImage(Buffer.from(await file.arrayBuffer()), folder);
    return NextResponse.json({ ...result, url: imageUrl(result.key, "card") });
  } catch {
    return NextResponse.json({ error: "Slika se ne može obraditi" }, { status: 422 });
  }
}
