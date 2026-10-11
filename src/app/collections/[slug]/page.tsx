import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listCategories, getCategoryBySlug, listProducts } from "@/server/catalogue/queries";
import { CatalogueFilters } from "@/components/catalogue/CatalogueFilters";
import { ProductCard } from "@/components/ui/product-card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { PersonalizationRequestForm } from "@/components/catalogue/PersonalizationRequestForm";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; inStock?: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Collection Not Found | VAP Handicrafts" };
  }

  return {
    title: `${category.name} | VAP Handicrafts`,
    description: category.description ?? undefined,
  };
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const { sort, inStock } = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const allCategories = await listCategories();
  const { products, total } = await listProducts({
    categorySlug: slug,
    sort: (sort as any) ?? "featured",
    inStockOnly: inStock === "true",
  });

  return (
    <Section surface="default" className="py-12 md:py-16">
      <Container>
        {/* Breadcrumb / Back button */}
        <Link
          href="/shop"
          className="inline-flex items-center text-xs font-medium text-cocoa-muted hover:text-rose-deep mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> Back to All Collections
        </Link>

        {/* Collection Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2.5 text-xs">
            Collection
          </Badge>
          <Heading level="h1" className="text-3xl sm:text-4xl">
            {category.name}
          </Heading>
          {category.description && (
            <p className="mt-2 text-sm text-cocoa-muted max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}
        </div>

        {/* Filters & Sorting */}
        <div className="mb-8">
          <CatalogueFilters
            categories={allCategories}
            activeCategorySlug={slug}
            totalProducts={total}
          />
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              // Convert ProductDetail to Product format expected by ProductCard
              const cardProduct = {
                id: product.id,
                name: product.name,
                slug: product.slug,
                category_slug: product.categorySlug,
                category_name: product.categoryName,
                description: product.description,
                price_minor: product.priceMinor,
                compare_at_price_minor: product.compareAtPriceMinor ?? null,
                is_dev_price: product.isDevPrice,
                status: product.status,
                stock_quantity: product.variants[0]?.stockQuantity ?? 10,
                fulfilment_type: product.fulfilmentType,
                materials: product.materials,
                dimensions: product.dimensions ?? "",
                images: product.images.map((img) => ({
                  url: img.url,
                  alt: img.alt,
                  width: img.width,
                  height: img.height,
                  is_primary: img.isPrimary,
                })),
                variants: product.variants.map((v) => ({
                  id: v.id,
                  name: v.name,
                  sku: v.sku,
                  price_minor: v.priceMinor,
                  in_stock: v.inStock,
                })),
                tags: [],
              };
              return <ProductCard key={product.id} product={cardProduct} />;
            })}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border p-12 text-center bg-surface/60">
            <p className="text-sm text-cocoa font-medium">No items found matching the current filters.</p>
            <p className="mt-1 text-xs text-cocoa-muted">Try clearing the filters or check back shortly.</p>
          </div>
        )}

        {/* Embedded Interactive Personalization & CRM Form for Cards */}
        {(slug === "personalized-cards" || slug === "personalized-gifts") && (
          <PersonalizationRequestForm />
        )}
      </Container>
    </Section>
  );
}
