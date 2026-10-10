import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Shop All Collections",
  description: "Browse handcrafted shell jewellery, personalized keepsakes, and romantic gifts.",
};

const categories = [
  {
    slug: "jewellery",
    name: "Shell Jewellery",
    description: "Delicate shell bracelets, matching earrings, and floral charm pieces.",
  },
  {
    slug: "keepsakes",
    name: "Personalized Keepsakes",
    description: "Custom Polaroid memory frames, bestfriend cards, and magazine keepsakes.",
  },
  {
    slug: "gift-sets",
    name: "Gift Sets",
    description: "Artfully packaged gift bundles for birthdays, anniversaries, and milestones.",
  },
];

export default function ShopPage() {
  return (
    <Section surface="default" className="py-12 md:py-20">
      <Container>
        <div className="mb-12">
          <Badge variant="default" className="mb-3">
            Storefront
          </Badge>
          <Heading level="h1" className="mb-4">
            Shop All Collections
          </Heading>
          <p className="text-base text-cocoa-muted max-w-2xl leading-relaxed">
            Explore our handcrafted designs. Full interactive product catalogue and filter engine launches in Phase 3 once product photography and inventory are loaded.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.slug}
              className="rounded-md border border-border bg-surface p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <Heading level="h3" className="mb-2">
                  {category.name}
                </Heading>
                <p className="text-sm text-cocoa-muted mb-6 leading-relaxed">
                  {category.description}
                </p>
              </div>
              <div>
                <Button asChild variant="primary" size="sm">
                  <Link href={`/shop/${category.slug}`}>
                    Explore {category.name}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
