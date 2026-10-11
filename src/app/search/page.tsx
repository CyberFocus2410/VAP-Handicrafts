import { Metadata } from "next";
import { Search as SearchIcon } from "lucide-react";
import { listProducts } from "@/server/catalogue/queries";
import { ProductCard } from "@/components/ui/product-card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Search Catalogue | VAP Handicrafts",
  description: "Search handcrafted shell jewellery, personalized gifts, and custom creations.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const { products, total } = query
    ? await listProducts({ search: query, limit: 20 })
    : { products: [], total: 0 };

  return (
    <Section surface="default" className="py-12 md:py-20">
      <Container className="max-w-5xl">
        <div className="text-center mb-10">
          <Heading level="h1" className="text-3xl sm:text-4xl mb-3">
            {query ? `Search Results` : "Search Catalogue"}
          </Heading>
          <p className="text-sm text-cocoa-muted max-w-lg mx-auto">
            {query
              ? `Showing results matching "${query}"`
              : "Find authentic ocean shell jewellery and custom personalized cards."}
          </p>

          {/* Search Bar Form */}
          <form
            action="/search"
            method="GET"
            className="mt-6 flex max-w-lg mx-auto items-center gap-2 rounded-full border border-border bg-surface p-1.5 shadow-sm focus-within:border-rose-deep focus-within:ring-2 focus-within:ring-ring"
          >
            <div className="pl-3 text-cocoa-muted">
              <SearchIcon className="h-4 w-4" aria-hidden="true" />
            </div>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search shell bracelet, earrings, pearls..."
              className="w-full bg-transparent px-2 py-1 text-sm text-cocoa outline-none placeholder:text-cocoa-muted/70"
              aria-label="Search items"
            />
            <Button type="submit" size="sm" className="rounded-full px-5">
              Search
            </Button>
          </form>
        </div>

        {/* Results Area */}
        {query ? (
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-border/80 pb-3">
              <p className="text-xs text-cocoa-muted">
                Showing <strong className="text-cocoa">{total}</strong> result
                {total === 1 ? "" : "s"} found for &ldquo;
                <span className="font-semibold text-cocoa">{query}</span>&rdquo;
              </p>
            </div>

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
              <div className="rounded-md border border-dashed border-border p-12 text-center bg-surface/50">
                <p className="text-sm font-medium text-cocoa">No creations found matching &ldquo;{query}&rdquo;.</p>
                <p className="mt-2 text-xs text-cocoa-muted">
                  Try searching for terms like <em>&ldquo;bracelet&rdquo;</em>, <em>&ldquo;shell&rdquo;</em>, <em>&ldquo;earring&rdquo;</em>, or <em>&ldquo;pearl&rdquo;</em>.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md border border-border/70 bg-surface p-8 text-center">
            <h2 className="text-sm font-semibold text-cocoa mb-3">Popular Searches</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {["Shell Bracelet", "Cowrie Earring", "Gift Set", "Crackle Beads", "Ocean Charms"].map((term) => (
                <a
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-border bg-bg/80 px-3.5 py-1 text-xs text-cocoa transition-colors hover:border-rose-deep hover:text-rose-deep"
                >
                  {term}
                </a>
              ))}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
