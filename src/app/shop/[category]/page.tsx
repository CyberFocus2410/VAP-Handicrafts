import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { SEED_PRODUCTS } from "@/data/seed-products";
import { PersonalizationRequestForm } from "@/components/catalogue/PersonalizationRequestForm";

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
  "personalized-cards": {
    title: "Personalized Cards",
    description: "Custom photo cards, heartfelt relationship cards, and memories preserved with love.",
    filterCategory: "personalized-cards",
  },
  "personalized-gifts": {
    title: "Personalized Cards",
    description: "Custom photo cards, heartfelt relationship cards, and memories preserved with love.",
    filterCategory: "personalized-cards",
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
            Category Not Found
          </Heading>
          <p className="text-cocoa-muted mb-8">
            The collection you are looking for is unavailable or has been updated.
          </p>
          <Button asChild variant="secondary">
            <Link href="/shop">
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" /> Back to All Collections
            </Link>
          </Button>
        </Container>
      </Section>
    );
  }

  const isPersonalized =
    category === "personalized-cards" || category === "personalized-gifts";

  const matchingProducts = categoryData.filterCategory
    ? SEED_PRODUCTS.filter((p) => {
        if (isPersonalized) {
          return p.category_slug === "personalized-cards" || p.category_slug === "personalized-gifts";
        }
        return p.category_slug === categoryData.filterCategory;
      })
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
          <div className="rounded-3xl border border-[#2D1A16]/10 p-12 text-center bg-white/60 shadow-sm max-w-xl mx-auto">
            <span className="text-3xl mb-3 block">🐚</span>
            <h3 className="font-serif text-xl font-bold text-[#2D1A16] mb-2">
              Custom Creations on Request
            </h3>
            <p className="text-cocoa-muted text-sm max-w-md mx-auto mb-6 leading-relaxed">
              We handcraft bespoke tokens and favours for destination weddings, festive ceremonies, and private events.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="primary">
                <Link href="/contact">Inquire for Custom Order</Link>
              </Button>
              <a
                href="https://wa.me/919311516813"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Founders
              </a>
            </div>
          </div>
        )}

        {/* Embedded Interactive Personalization & CRM Form for Cards */}
        {isPersonalized && <PersonalizationRequestForm />}
      </Container>
    </Section>
  );
}
