import { requireDealer } from "@/lib/dal";
import { getCatalog } from "@/lib/catalog";
import { imageUrl } from "@/lib/images";
import DealerForm from "@/features/dealer-panel/components/DealerForm";
import { updateDealer } from "@/features/dealer-panel/actions";

export default async function DealerProfilePage() {
  const dealer = await requireDealer();
  const { cities } = await getCatalog();
  const logo = dealer.logoKey ? { key: dealer.logoKey, url: imageUrl(dealer.logoKey, "card") } : null;
  return <DealerForm action={updateDealer} cities={cities} dealer={dealer} logo={logo} submitLabel="Sačuvaj" />;
}
