import type { Metadata } from "next";
import TermsPage from "@/features/legal/pages/TermsPage";

export const metadata: Metadata = {
  title: "Uslovi korišćenja",
  description: "Pravila korišćenja sajta za posjetioce i autoplaceve.",
  alternates: { canonical: "/uslovi" },
};

export default function Page() {
  return <TermsPage />;
}
