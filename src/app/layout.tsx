import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Header from "@/features/shared/components/layout/Header";
import Footer from "@/features/shared/components/layout/Footer";
import Providers from "./providers";
import { SITE } from "@/config/site";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} – ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, locale: "sr_ME", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sr-Latn-ME" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#sadrzaj"
          className="focus:bg-foreground sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded-lg focus:px-4 focus:py-2 focus:text-white"
        >
          Preskoči na sadržaj
        </a>
        <Providers>
          <Header />
          <main id="sadrzaj" className="flex flex-1 flex-col">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
