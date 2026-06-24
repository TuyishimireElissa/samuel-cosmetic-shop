import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Samuel Cosmetic Shop — Beauty for Every Rwandan",
  description:
    "Quality makeup, skincare, and fragrances in Kigali, Rwanda. Shop online or order via WhatsApp. RWF prices, RRA-compliant EBM receipts.",
  keywords: [
    "cosmetics Rwanda",
    "makeup Kigali",
    "skincare Rwanda",
    "perfume Kigali",
    "Samuel Cosmetic Shop",
    "beauty Rwanda",
  ],
  authors: [{ name: "Samuel Cosmetic Shop" }],
  openGraph: {
    title: "Samuel Cosmetic Shop — Beauty for Every Rwandan",
    description: "Quality makeup, skincare, and fragrances in Kigali, Rwanda.",
    siteName: "Samuel Cosmetic Shop",
    type: "website",
    locale: "rw_RW",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="rw" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${poppins.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster richColors position="top-right" />
        <Analytics />
      </body>
    </html>
  );
}
