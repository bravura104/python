import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Header from "@/components/Header";
import BootstrapInit from "@/components/BootstrapInit";
import MobileFooter from "@/components/MobileFooter";
import TopSlogan from "@/components/TopSlogan";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HangPho36.vn – Marketplace for Everything",
  description: "Discover a modern ecommerce marketplace for products across every category.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900 antialiased font-sans">
        <CartProvider>
          <BootstrapInit />
          <Header />
          {/* Top slogan with dingtee background */}
          <TopSlogan />
          <main className="flex-1">{children}</main>
          <MobileFooter />
          <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} HangPho36.vn. All rights reserved.</p>
            <p className="mt-2">
              <a href="/return-policy" className="text-gray-400 hover:text-gray-600 underline transition-colors">
                Return &amp; Refund Policy
              </a>
            </p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
