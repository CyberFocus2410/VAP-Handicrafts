"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle2, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { type ProductDetail, type ProductVariant } from "@/server/catalogue/types";
import { ProductGallery } from "@/components/catalogue/ProductGallery";
import { VariantSelector } from "@/components/catalogue/VariantSelector";
import { Price } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart/cart-store";

interface ProductDetailsViewProps {
  product: ProductDetail;
}

export function ProductDetailsView({ product }: ProductDetailsViewProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant>(
    product.variants[0] || {
      id: "var-default",
      productId: product.id,
      name: "Standard",
      sku: "VAP-STD",
      priceMinor: product.priceMinor,
      compareAtPriceMinor: product.compareAtPriceMinor,
      stockQuantity: 10,
      isDevPrice: product.isDevPrice,
      inStock: true,
      attributes: {},
    }
  );

  const [isAdded, setIsAdded] = React.useState(false);

  const isCardProduct =
    product.categorySlug === "personalized-cards" ||
    product.categorySlug === "personalized-gifts" ||
    product.slug.includes("card") ||
    product.slug.includes("polaroid") ||
    product.slug.includes("licence");

  const isOutOfStock =
    !selectedVariant.inStock ||
    (typeof selectedVariant.stockQuantity === "number" && selectedVariant.stockQuantity === 0);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      productSlug: product.slug,
      variantId: selectedVariant.id,
      quantity: 1,
    });
    openDrawer();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  // Truthful JSON-LD Structured Data (PRD §8.3 / RULES B6 — No fake ratings)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    sku: selectedVariant.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (selectedVariant.priceMinor / 100).toFixed(2),
      availability: isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url: `/products/${product.slug}`,
    },
  };

  return (
    <>
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-xs text-cocoa-muted">
            <li>
              <Link href="/" className="hover:text-rose-deep">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/shop" className="hover:text-rose-deep">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/collections/${product.categorySlug}`}
                className="hover:text-rose-deep"
              >
                {product.categoryName}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-cocoa" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-6">
            <ProductGallery images={product.images} />
          </div>

          {/* Right Column: Details & Purchasing Controls (7 cols) */}
          <div className="flex flex-col gap-6 lg:col-span-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {product.categoryName}
                </Badge>
                {product.fulfilmentType === "made_to_order" ? (
                  <Badge variant="outline" className="text-xs">
                    Made to Order
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-xs">
                    In Stock
                  </Badge>
                )}
              </div>

              <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-cocoa sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-4">
                <Price
                  paise={selectedVariant.priceMinor}
                  compareAtPaise={selectedVariant.compareAtPriceMinor ?? undefined}
                  isDevPrice={selectedVariant.isDevPrice}
                  className="text-2xl"
                />
                <span className="text-xs text-cocoa-muted">
                  SKU: <span className="font-mono">{selectedVariant.sku}</span>
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-cocoa-muted">
              {product.description}
            </p>

            {/* Variant Selector */}
            <VariantSelector
              variants={product.variants}
              selectedVariantId={selectedVariant.id}
              onSelectVariant={setSelectedVariant}
            />

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                size="lg"
                variant={isOutOfStock ? "secondary" : "primary"}
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="w-full text-base shadow-soft"
              >
                {isOutOfStock
                  ? "Sold Out"
                  : isAdded
                  ? "Added to Cart ✓"
                  : "Add to Cart"}
              </Button>

              <Button asChild variant="outline" size="lg" className="w-full border-rose-deep/40 text-rose-deep hover:bg-blush/20">
                <Link href={`/personalize/${product.slug}`} className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-deep" />
                  <span>Personalize With a Custom Card</span>
                </Link>
              </Button>

              <Button asChild variant="secondary" size="lg" className="w-full">
                <Link href="/cart">Go to Cart</Link>
              </Button>
            </div>

            {/* Specifications & Materials */}
            {product.materials.length > 0 && (
              <div className="border-t border-border pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-cocoa">
                  Materials & Craftsmanship
                </h2>
                <ul className="mt-3 space-y-2 text-xs text-cocoa-muted">
                  {product.materials.map((m) => (
                    <li key={m} className="flex items-center gap-2">
                      <CheckCircle2
                        className="h-3.5 w-3.5 shrink-0 text-rose-deep"
                        aria-hidden="true"
                      />
                      <span>{m}</span>
                    </li>
                  ))}
                  {product.dimensions && (
                    <li className="flex items-center gap-2">
                      <Sparkles
                        className="h-3.5 w-3.5 shrink-0 text-rose-deep"
                        aria-hidden="true"
                      />
                      <span>Fit / Dimensions: {product.dimensions}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Trust Assurances */}
            <div
              className={`grid grid-cols-1 gap-3 rounded-md border border-border/70 bg-surface p-4 text-xs ${
                isCardProduct ? "sm:grid-cols-2" : "sm:grid-cols-3"
              }`}
            >
              {!isCardProduct && (
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-rose-deep" />
                  <div>
                    <span className="font-semibold text-cocoa">100% Authentic</span>
                    <p className="text-[11px] text-cocoa-muted">Real natural sea shells</p>
                  </div>
                </div>
              )}
              <Link href="/shipping-policy" className="flex items-start gap-2.5 hover:opacity-80 transition-opacity">
                <Truck className="h-4 w-4 shrink-0 text-rose-deep" />
                <div>
                  <span className="font-semibold text-cocoa">Pan-India Ship</span>
                  <p className="text-[11px] text-cocoa-muted">Tracked express courier</p>
                </div>
              </Link>
              <Link href="/refund-policy" className="flex items-start gap-2.5 hover:opacity-80 transition-opacity">
                <RefreshCw className="h-4 w-4 shrink-0 text-rose-deep" />
                <div>
                  <span className="font-semibold text-cocoa">Safe Delivery</span>
                  <p className="text-[11px] text-cocoa-muted">Insured gift packaging</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
