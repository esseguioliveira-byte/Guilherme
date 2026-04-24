import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import ReferralTracker from "@/components/ReferralTracker";
import SpaceBackground from "@/components/SpaceBackground";
import VisitorTracker from "@/components/VisitorTracker";
import ScrollAnimator from "@/components/ScrollAnimator";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "BAHIA'S STORE | Produtos Digitais",
  description: "A melhor loja de assinaturas e produtos digitais da Bahia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <SpaceBackground />
          <ReferralTracker />
          <VisitorTracker />
          {children}

          <ScrollAnimator />
          <CartDrawer />

        </CartProvider>
      </body>
    </html>
  );
}
