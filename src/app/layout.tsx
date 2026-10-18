import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Header } from "@/components/header";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: { default: "Autoplac", template: "%s | Autoplac" },
  description: "Polovni automobili iz autoplaceva u Crnoj Gori na jednom mjestu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sr-Latn-ME" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
