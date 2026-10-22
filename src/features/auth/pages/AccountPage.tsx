import { requireSession } from "@/lib/dal";
import Button from "@/features/shared/components/ui/Button";
import VerifyEmailNotice from "@/features/auth/components/VerifyEmailNotice";
import EmailConfirmedBanner from "@/features/auth/components/EmailConfirmedBanner";

const ROLE = { admin: "Administrator", dealer: "Autoplac", private: "Privatni korisnik" } as const;

export default async function AccountPage() {
  const { user } = await requireSession("/nalog");
  return (
    <div className="flex flex-col gap-4">
      <EmailConfirmedBanner />
      {!user.emailVerified && user.email && <VerifyEmailNotice email={user.email} />}
      <dl className="container-box grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
        <dt className="text-muted">Ime</dt>
        <dd className="font-medium">{user.name}</dd>
        <dt className="text-muted">Email</dt>
        <dd className="font-medium">
          <span>{user.email}</span>
          {user.emailVerified && <span className="text-success ml-2 text-xs font-semibold">potvrđen</span>}
        </dd>
        <dt className="text-muted">Tip naloga</dt>
        <dd className="font-medium">{ROLE[user.role]}</dd>
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button href="/nalog/favoriti" variant="outline" size="sm">
          Sačuvani oglasi
        </Button>
        {user.role !== "private" && (
          <Button href="/plac" variant="outline" size="sm">
            Moj autoplac
          </Button>
        )}
        {user.role === "admin" && (
          <Button href="/admin" variant="outline" size="sm">
            Admin
          </Button>
        )}
      </div>
    </div>
  );
}
