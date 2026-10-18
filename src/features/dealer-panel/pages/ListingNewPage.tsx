import { requireDealer } from "@/lib/dal";
import { getCatalog } from "@/lib/catalog";
import ListingForm from "@/features/dealer-panel/components/ListingForm";
import { saveListing } from "@/features/dealer-panel/actions";

export default async function ListingNewPage() {
  await requireDealer();
  const catalog = await getCatalog();
  return <ListingForm action={saveListing.bind(null, null)} catalog={catalog} />;
}
