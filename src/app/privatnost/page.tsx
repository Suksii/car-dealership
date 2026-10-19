import type { Metadata } from "next";
import PrivacyPage from "@/features/legal/pages/PrivacyPage";

export const metadata: Metadata = {
  title: "Politika privatnosti",
  description: "Koje podatke čuvamo, zašto, koliko dugo i koja su tvoja prava.",
  alternates: { canonical: "/privatnost" },
};

export default function Page() {
  return <PrivacyPage />;
}
