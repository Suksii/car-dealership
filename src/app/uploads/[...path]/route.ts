import { readFile } from "node:fs/promises";
import { join, normalize } from "node:path";
import { LOCAL_UPLOAD_DIR } from "@/lib/storage";

// Servira lokalno sačuvane slike u razvoju. U produkciji slike idu sa R2 i ova ruta se ne koristi.
export async function GET(_req: Request, { params }: RouteContext<"/uploads/[...path]">) {
  const { path } = await params;
  const rel = normalize(path.join("/"));
  if (rel.startsWith("..") || rel.includes("\0")) return new Response("Not found", { status: 404 });
  try {
    const buf = await readFile(join(LOCAL_UPLOAD_DIR, rel));
    const type = rel.endsWith(".webp") ? "image/webp" : rel.endsWith(".png") ? "image/png" : "image/jpeg";
    return new Response(buf, {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
