import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

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
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Samuel Cosmetic Shop",
  description: "Quality makeup, skincare, and fragrances in Kigali, Rwanda.",
  image: "/logo.svg",
  url: "https://samuelcosmeticshop.rw",
  telephone: "+250790215965",
  email: "samuelcosmeticshop@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kigali",
    addressCountry: "RW",
  },
  openingHours: "Mo-Sa 08:00-20:00",
  priceRange: "RWF",
  vatID: "102345678",
  sameAs: ["https://wa.me/250790215965"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="rw" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${playfair.variable} ${poppins.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </body>
    </html>
  );
}
