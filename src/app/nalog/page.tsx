import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata: Metadata = { title: "Moj nalog" };

const roleLabel = { admin: "Administrator", dealer: "Autoplac", private: "Privatni korisnik" } as const;

async function AccountInfo() {
  const session = await auth();
  if (!session) redirect("/prijava?next=/nalog");
  const { user } = session;
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
      <dt className="text-zinc-500">Ime</dt><dd>{user.name}</dd>
      <dt className="text-zinc-500">Email</dt><dd>{user.email}</dd>
      <dt className="text-zinc-500">Tip naloga</dt><dd>{roleLabel[user.role]}</dd>
    </dl>
  );
}

export default function NalogPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Moj nalog</h1>
      <Suspense fallback={<p className="text-zinc-500">Učitavanje...</p>}>
        <AccountInfo />
      </Suspense>
    </div>
  );
}
