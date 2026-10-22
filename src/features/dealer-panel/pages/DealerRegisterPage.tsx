import { redirect } from "next/navigation";
import { getMyDealer, requireSession } from "@/lib/dal";
import { getCatalog } from "@/lib/catalog";
import DealerForm from "@/features/dealer-panel/components/DealerForm";
import VerifyEmailNotice from "@/features/auth/components/VerifyEmailNotice";
import { createDealer } from "@/features/dealer-panel/actions";

export default async function DealerRegisterPage() {
  if (await getMyDealer()) redirect("/plac");
  const { user } = await requireSession("/plac/registracija");
  // Plac šalje i prima emailove (obavještenja, reset lozinke), pa adresa mora biti potvrđena.
  if (!user.emailVerified) {
    return (
      <VerifyEmailNotice
        email={user.email ?? ""}
        reason="Autoplac možeš registrovati kad potvrdiš email: klikni na link iz poruke, pa se vrati ovdje."
      />
    );
  }
  const { cities } = await getCatalog();
  return <DealerForm action={createDealer} cities={cities} submitLabel="Registruj autoplac" />;
}
