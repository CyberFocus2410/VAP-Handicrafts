import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { BRAND } from "@/config/brand";
import { SkipLink } from "@/components/ui/skip-link";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LiveRegionProvider } from "@/components/ui/live-region";
import { CartDrawer } from "@/components/cart/CartDrawer";
import "@/styles/globals.css";

const fontDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const fontSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://vaphandicrafts.com"),
  keywords: [
    "shell jewellery",
    "personalized gifts",
    "personalized cards",
    "handmade jewellery India",
    "polaroid custom gifts",
    "custom gifts",
    "VAP Handicrafts",
  ],
  authors: [{ name: BRAND.name }],
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    type: "website",
    locale: "en_IN",
    siteName: BRAND.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontSans.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-bg text-cocoa antialiased flex flex-col">
        <LiveRegionProvider>
          <SkipLink />
          <AnnouncementBar />
          <Header />
          <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </LiveRegionProvider>
      </body>
    </html>
  );
}
