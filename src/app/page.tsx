import { HeroSection } from "@/components/home/HeroSection";
import { TrustHighlights } from "@/components/home/TrustHighlights";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { ScrapbookKeepsakes } from "@/components/home/ScrapbookKeepsakes";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { PersonalizedGiftFeature } from "@/components/home/PersonalizedGiftFeature";
import { BrandStory } from "@/components/home/BrandStory";
import { getSiteContentConfig } from "@/server/admin/cms-service";
import { listCategories, listProducts } from "@/server/catalogue/queries";

export const revalidate = 60;

export const metadata = {
  title: "VAP Handicrafts | Shell Jewellery & Personalized Gifts",
  description:
    "Handcrafted shell jewellery and bespoke personalized cards made with natural seashells and crackle beads. Delivered across India with secure UPI payments.",
  keywords: [
    "shell jewellery India",
    "cowrie shell bracelet",
    "conch shell necklace",
    "personalized cards",
    "relationship licence card",
    "polaroid keepsake gifts",
    "handmade gifts India",
    "VAP Handicrafts",
  ],
  alternates: {
    canonical: "https://vap-handicrafts.vercel.app/",
  },
  openGraph: {
    title: "VAP Handicrafts | Handcrafted Shell Jewellery & Custom Keepsakes",
    description:
      "Authentic handcrafted ocean shell bracelets, conch necklaces, and customizable keepsake cards. Shop genuine artisan crafts with fast delivery across India.",
    url: "/",
    siteName: "VAP Handicrafts",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VAP Handicrafts — Handcrafted Shell Jewellery & Gifts",
        type: "image/png",
      },
      {
        url: "/og-image-square.png",
        width: 800,
        height: 800,
        alt: "VAP Handicrafts — Handcrafted Shell Jewellery & Gifts",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VAP Handicrafts | Shell Jewellery & Personalized Gifts",
    description: "Authentic handcrafted ocean shell bracelets, conch necklaces, and customizable keepsake cards.",
    images: ["/og-image.png"],
  },
};

export default async function HomePage() {
  const [contentConfig, categories, productsResult] = await Promise.all([
    getSiteContentConfig().catch(() => null),
    listCategories().catch(() => []),
    listProducts({ limit: 12 }).catch(() => ({ products: [] })),
  ]);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
      : "https://vap-handicrafts.vercel.app";

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured Handcrafted Jewellery & Personalized Gifts",
    description:
      "Explore our collection of handcrafted shell bracelets, cowrie chokers, conch necklaces, and customizable keepsake cards.",
    itemListElement: productsResult.products.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: p.name,
      url: `${baseUrl}/shop/${p.slug}`,
      image: p.images[0]?.url
        ? p.images[0].url.startsWith("http")
          ? p.images[0].url
          : `${baseUrl}${p.images[0].url}`
        : undefined,
    })),
  };

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* 1. Hero Section (dynamic CMS content) */}
      <HeroSection hero={contentConfig?.hero} />

      {/* 2. Trust Highlights (grounded, factual value propositions) */}
      <TrustHighlights />

      {/* 3. Featured Collections (dynamic CMS categories & image) */}
      <FeaturedCollections categories={categories} />

      {/* 4. Scrapbook Keepsakes (dynamic CMS polaroid gallery) */}
      <ScrapbookKeepsakes items={contentConfig?.scrapbook} />

      {/* 5. Featured Products (live CMS products & pricing) */}
      <FeaturedProducts />

      {/* 6. Personalized Gift Feature */}
      <PersonalizedGiftFeature />

      {/* 7. Brand Story (dynamic CMS narrative & founders story) */}
      <BrandStory brandStory={contentConfig?.brandStory} />
    </div>
  );
}
