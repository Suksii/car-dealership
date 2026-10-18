import { requireSession } from "@/lib/dal";

const ROLE = { admin: "Administrator", dealer: "Autoplac", private: "Privatni korisnik" } as const;

export default async function AccountPage() {
  const { user } = await requireSession("/nalog");
  return (
    <dl className="container-box grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
      <dt className="text-muted">Ime</dt><dd className="font-medium">{user.name}</dd>
      <dt className="text-muted">Email</dt><dd className="font-medium">{user.email}</dd>
      <dt className="text-muted">Tip naloga</dt><dd className="font-medium">{ROLE[user.role]}</dd>
    </dl>
  );
}
