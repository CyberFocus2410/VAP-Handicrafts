import { Metadata } from "next";
import { listCategories, listProducts } from "@/server/catalogue/queries";
import { CatalogueFilters } from "@/components/catalogue/CatalogueFilters";
import { ProductCard } from "@/components/ui/product-card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Shop All Collections | VAP Handicrafts",
  description: "Browse handcrafted shell jewellery, personalized gifts, and romantic creations made in India.",
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
    <Section surface="default" className="py-12 md:py-16">
      <Container>
        {/* Page Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2.5 text-xs">
            Storefront
          </Badge>
          <Heading level="h1" className="text-3xl sm:text-4xl">
            Shop All Collections
          </Heading>
          <p className="mt-2 text-sm text-cocoa-muted max-w-2xl leading-relaxed">
            Discover handcrafted shell jewellery, gift sets, and personalized creations made with authentic ocean shells.
          </p>
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
