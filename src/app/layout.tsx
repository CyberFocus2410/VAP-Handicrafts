import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { BRAND } from "@/config/brand";
import { SkipLink } from "@/components/ui/skip-link";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LiveRegionProvider } from "@/components/ui/live-region";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FreebieUnlockSlidingBar } from "@/components/cart/FreebieUnlockSlidingBar";
import { CookieConsentBanner } from "@/components/ui/cookie-consent";
import "@/styles/globals.css";

export const dynamic = "force-dynamic";

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_APP_URL
      : "https://vap-handicrafts.vercel.app"
  ),
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    type: "website",
    locale: "en_IN",
    siteName: BRAND.name,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${BRAND.name} — ${BRAND.tagline}`,
        type: "image/png",
      },
      {
        url: "/og-image-square.png",
        width: 800,
        height: 800,
        alt: `${BRAND.name} — ${BRAND.tagline}`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VAP Handicrafts",
  },
  verification: {
    google: "googlea03686d795340eb0",
    other: {
      "google-site-verification": ["googlea03686d795340eb0", "googlea03686d795340eb0.html"],
      "msvalidate.01": "E5581AA9ABA3AF2FE0E16A129B506495",
    },
  },
};

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
    : "https://vap-handicrafts.vercel.app";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND.name,
  legalName: BRAND.legalName,
  url: baseUrl,
  logo: `${baseUrl}/images/brand/logo.png`,
  image: `${baseUrl}/og-image.png`,
  description: BRAND.description,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-9990928277",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["en", "hi"],
  },
  sameAs: [BRAND.contact.instagramUrl],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND.name,
  url: baseUrl,
  description: BRAND.description,
  potentialAction: {
    "@type": "SearchAction",
    target: `${baseUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: BRAND.name,
    logo: `${baseUrl}/images/brand/logo.png`,
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
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
          <FreebieUnlockSlidingBar />
          <CookieConsentBanner />
        </LiveRegionProvider>
      </body>
    </html>
  );
}
