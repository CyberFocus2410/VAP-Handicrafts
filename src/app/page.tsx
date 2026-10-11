import { HeroSection } from "@/components/home/HeroSection";
import { TrustHighlights } from "@/components/home/TrustHighlights";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { ScrapbookKeepsakes } from "@/components/home/ScrapbookKeepsakes";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { PersonalizedGiftFeature } from "@/components/home/PersonalizedGiftFeature";
import { BrandStory } from "@/components/home/BrandStory";

export const metadata = {
  title: "VAP Handicrafts | Shell Jewellery & Personalized Gifts",
  description:
    "Handcrafted shell jewellery and bespoke personalized cards made with natural seashells and crackle beads. Delivered across India with secure UPI payments.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero Section (with R3F 3D handcrafted jewellery scene + static fallback) */}
      <HeroSection />

      {/* 2. Trust Highlights (grounded, factual value propositions) */}
      <TrustHighlights />

      {/* 3. Featured Collections */}
      <FeaturedCollections />

      {/* 4. Scrapbook Keepsakes (layered Polaroid gallery with authentic photos) */}
      <ScrapbookKeepsakes />

      {/* 5. Featured Products (seed data shaped like DB with dev-price badges) */}
      <FeaturedProducts />

      {/* 6. Personalized Gift Feature */}
      <PersonalizedGiftFeature />

      {/* 7. Brand Story (flagged with owner review notice) */}
      <BrandStory />
    </div>
  );
}
