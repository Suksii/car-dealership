import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Polovni automobili iz autoplaceva u Crnoj Gori</h1>
      <p className="mt-3 max-w-xl text-zinc-600">
        Pregledaj ponudu svih autoplaceva na jednom mjestu, ili izaberi plac u svom gradu.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/automobili" className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">Svi automobili</Link>
        <Link href="/placevi" className="rounded-md border border-zinc-300 bg-white px-4 py-2 font-medium hover:bg-zinc-50">Autoplacevi</Link>
      </div>
    </div>
  );
}
