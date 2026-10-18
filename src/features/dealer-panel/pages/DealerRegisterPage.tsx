import { redirect } from "next/navigation";
import { getMyDealer } from "@/lib/dal";
import { getCatalog } from "@/lib/catalog";
import DealerForm from "@/features/dealer-panel/components/DealerForm";
import { createDealer } from "@/features/dealer-panel/actions";

export default async function DealerRegisterPage() {
  if (await getMyDealer()) redirect("/plac");
  const { cities } = await getCatalog();
  return <DealerForm action={createDealer} cities={cities} submitLabel="Registruj autoplac" />;
}
