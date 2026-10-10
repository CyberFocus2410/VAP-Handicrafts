import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { SEED_PRODUCTS } from "@/data/seed-products";

export const metadata = {
  title: "Shop All Collections | VAP Handicrafts",
  description: "Browse handcrafted shell jewellery, personalized keepsakes, and romantic gifts.",
};

const categories = [
  {
    slug: "shell-jewellery",
    name: "Shell Jewellery",
    description: "Delicate shell bracelets, matching earrings, and floral charm pieces.",
  },
  {
    slug: "personalized-gifts",
    name: "Personalized Keepsakes",
    description: "Custom Polaroid memory frames, bestfriend cards, and magazine keepsakes.",
  },
  {
    slug: "keepsakes",
    name: "Cards & Gifts",
    description: "Artfully packaged gifts for birthdays, anniversaries, and milestones.",
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
            Explore our handcrafted designs. Handcrafted shell jewellery and personalized keepsakes with natural seaside treasures.
          </p>
        </div>

        {/* Featured Products Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-medium text-cocoa">
              Available Handcrafted Pieces
            </h2>
            <Badge variant="warning" className="text-xs">
              Dev Sample Prices
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SEED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <h2 className="font-serif text-2xl font-medium text-cocoa mb-6">
            Browse by Category
          </h2>
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
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/shop/${category.slug}`}>
                      Explore {category.name}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
