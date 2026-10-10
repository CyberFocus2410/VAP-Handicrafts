import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { ArrowLeft } from "lucide-react";
import { SEED_PRODUCTS } from "@/data/seed-products";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const validCategories: Record<string, { title: string; description: string; filterCategory?: string }> = {
  "shell-jewellery": {
    title: "Shell Jewellery",
    description: "Handcrafted charm bracelets, earrings, and delicate accessories made with natural ocean shells.",
    filterCategory: "shell-jewellery",
  },
  jewellery: {
    title: "Shell Jewellery",
    description: "Handcrafted charm bracelets, earrings, and delicate accessories made with natural ocean shells.",
    filterCategory: "shell-jewellery",
  },
  "personalized-gifts": {
    title: "Personalized Keepsakes & Polaroids",
    description: "Custom photo cards, heartfelt keepsake frames, and memories preserved forever.",
    filterCategory: "personalized-gifts",
  },
  keepsakes: {
    title: "Personalized Keepsakes",
    description: "Custom photo cards, heartfelt keepsake frames, and memories preserved forever.",
    filterCategory: "personalized-gifts",
  },
  "gift-sets": {
    title: "Gift Sets",
    description: "Curated gift combinations packaged with luxury presentation.",
    filterCategory: "shell-jewellery",
  },
  "return-favors": {
    title: "Festive & Return Favors",
    description: "Charming tokens of gratitude for weddings, ceremonies, and milestone celebrations.",
  },
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const data = validCategories[category];
  if (!data) return { title: "Category Not Found | VAP Handicrafts" };
  return {
    title: `${data.title} | VAP Handicrafts`,
    description: data.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryData = validCategories[category];

  if (!categoryData) {
    return (
      <Section surface="default" className="py-16">
        <Container className="text-center">
          <Heading level="h1" className="mb-4">
            Category: {category}
          </Heading>
          <p className="text-cocoa-muted mb-8">
            Products for this category will be populated in Phase 3.
          </p>
          <Button asChild variant="secondary">
            <Link href="/shop">
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" /> Back to Shop
            </Link>
          </Button>
        </Container>
      </Section>
    );
  }

  const matchingProducts = categoryData.filterCategory
    ? SEED_PRODUCTS.filter((p) => p.category_slug === categoryData.filterCategory)
    : [];

  return (
    <Section surface="default" className="py-12 md:py-20">
      <Container>
        <Link
          href="/shop"
          className="inline-flex items-center text-sm font-medium text-cocoa-muted hover:text-rose-deep mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" /> Back to All Collections
        </Link>

        <div className="mb-12">
          <Heading level="h1" className="mb-3">
            {categoryData.title}
          </Heading>
          <p className="text-base text-cocoa-muted max-w-xl">
            {categoryData.description}
          </p>
        </div>

        {matchingProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {matchingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border p-12 text-center bg-surface/50">
            <p className="text-cocoa-muted text-sm max-w-md mx-auto">
              Catalogue seed data and interactive product cards are scheduled for Phase 3 upon approval of product photos and pricing.
            </p>
          </div>
        )}
      </Container>
    </Section>
  );
}
