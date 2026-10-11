import { HeroSection } from "@/components/home/HeroSection";
import { TrustHighlights } from "@/components/home/TrustHighlights";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { ScrapbookKeepsakes } from "@/components/home/ScrapbookKeepsakes";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { PersonalizedGiftFeature } from "@/components/home/PersonalizedGiftFeature";
import { BrandStory } from "@/components/home/BrandStory";
import { getSiteContentConfig } from "@/server/admin/cms-service";
import { listCategories } from "@/server/catalogue/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VAP Handicrafts | Shell Jewellery & Personalized Gifts",
  description:
    "Handcrafted shell jewellery and bespoke personalized cards made with natural seashells and crackle beads. Delivered across India with secure UPI payments.",
};

export default async function HomePage() {
  const [contentConfig, categories] = await Promise.all([
    getSiteContentConfig().catch(() => null),
    listCategories().catch(() => []),
  ]);

  return (
    <div className="flex flex-col">
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
