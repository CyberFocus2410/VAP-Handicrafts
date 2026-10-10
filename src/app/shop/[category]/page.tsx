import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const validCategories: Record<string, { title: string; description: string }> = {
  jewellery: {
    title: "Shell Jewellery",
    description: "Handcrafted charm bracelets, earrings, and delicate accessories.",
  },
  keepsakes: {
    title: "Personalized Keepsakes",
    description: "Custom photo cards, heartfelt keepsake frames, and memories preserved forever.",
  },
  "gift-sets": {
    title: "Gift Sets",
    description: "Curated gift combinations packaged with luxury presentation.",
  },
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const data = validCategories[category];
  if (!data) return { title: "Category Not Found" };
  return {
    title: data.title,
    description: data.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryData = validCategories[category];

  if (!categoryData) {
    // If not in the pre-defined categories, still display a friendly placeholder or notFound
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

        <div className="rounded-md border border-dashed border-border p-12 text-center bg-surface/50">
          <p className="text-cocoa-muted text-sm max-w-md mx-auto">
            Catalogue seed data and interactive product cards are scheduled for Phase 3 upon approval of product photos and pricing.
          </p>
        </div>
      </Container>
    </Section>
  );
}
