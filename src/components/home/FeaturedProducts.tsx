import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SEED_PRODUCTS } from "@/data/seed-products";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";

export function FeaturedProducts() {
  return (
    <section
      aria-labelledby="featured-products-heading"
      className="py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-deep">
              Handcrafted & One-Of-A-Kind
            </p>
            <h2
              id="featured-products-heading"
              className="mt-2 font-serif text-h2 font-medium text-cocoa"
            >
              Featured Jewellery & Keepsakes
            </h2>
            <p className="mt-2 text-sm text-cocoa-muted">
              Handcrafted in small batches. Badges indicate dev-sample prices until owner confirms final catalogue rates.
            </p>
          </div>

          <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
            <Link href="/shop">
              <span>View All Products</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {/* 4-Column Responsive Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SEED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="secondary" className="w-full">
            <Link href="/shop">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
