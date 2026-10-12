import { Metadata } from "next";
import Link from "next/link";
import { listCategories, listProducts } from "@/server/catalogue/queries";
import { CatalogueFilters } from "@/components/catalogue/CatalogueFilters";
import { ProductCard } from "@/components/ui/product-card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Sparkles, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All Collections | VAP Handicrafts",
  description:
    "Explore our complete range of handcrafted shell jewellery, cowrie charm bracelets, floral earrings, and custom personalized keepsake cards. Free shipping across India on orders over ₹999.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop Handcrafted Shell Jewellery & Custom Gifts | VAP Handicrafts",
    description:
      "Explore handcrafted shell bracelets, cowrie chokers, and custom personalized cards. Handmade with natural materials.",
    url: "/shop",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Shop VAP Handicrafts" }],
  },
};

interface ShopPageProps {
  searchParams: Promise<{ sort?: string; inStock?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { sort, inStock } = await searchParams;

  const categories = await listCategories();
  const { products, total } = await listProducts({
    sort: (sort as any) ?? "featured",
    inStockOnly: inStock === "true",
  });

  return (
    <Section surface="default" className="py-10 md:py-16">
      <Container>
        {/* Breadcrumb Internal Navigation */}
        <Breadcrumbs items={[{ label: "Shop All Collections" }]} />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="secondary" className="mb-2.5 text-xs">
              Artisan Catalogue
            </Badge>
            <Heading level="h1" className="text-3xl sm:text-4xl">
              Shop All Collections
            </Heading>
            <p className="mt-2 text-sm text-cocoa-muted max-w-2xl leading-relaxed">
              Every bracelet, necklace, and keepsake card is handcrafted with authentic seashells, freshwater pearls, and heartfelt care.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-deep hover:underline py-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Need Custom Bulk Gifting? Inquire Here</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filters & Sorting */}
        <div className="mb-8">
          <CatalogueFilters
            categories={categories}
            totalProducts={total}
          />
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
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
            <p className="text-sm text-cocoa font-medium">No items match your selected filters.</p>
          </div>
        )}
      </Container>
    </Section>
  );
}
