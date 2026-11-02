import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import SiteChrome, { StorefrontFooter } from "@/components/SiteChrome";
import VisualEditsRuntime from "@/components/VisualEditsRuntime";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const vogue = localFont({ src: "../../public/fonts/Vogue-Regular.otf", variable: "--font-vogue", display: "swap" });

export const metadata: Metadata = {
  icons: { icon: "/images/WhatsApp%20Image%202026-10-12%20at%2007.54.43(2).jpeg" },
  title: "Aura & Aether Parfums | Artisanal Luxury Fragrances",
  description:
    "Discover Aura & Aether Parfums. Handcrafted luxury perfumes, rare essences, curated gift sets, and signature fragrance collections.",
  keywords: [
    "Aura & Aether",
    "Luxury Perfume",
    "Artisanal Fragrance",
    "Eau de Parfum",
    "Oud",
    "Gift Sets",
    "Ghana Fragrances",
  ],
  openGraph: {
    title: "Aura & Aether Parfums | Artisanal Luxury Fragrances",
    description: "Elevate everyday moments to extraordinary with Aura & Aether.",
    siteName: "Aura & Aether Parfums",
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} ${vogue.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans-clean bg-[var(--background)] text-[var(--foreground)] selection:bg-[#EADBC8] selection:text-[#1C1917]">
        <AuthProvider>
          <CartProvider>
            <SiteChrome />
            <main className="flex-1">{children}</main>
            <StorefrontFooter />
            <VisualEditsRuntime />
            {modal}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
