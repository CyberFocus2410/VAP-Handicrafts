"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/data/seed-products";
import { Price } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ProductCardProps extends React.HTMLAttributes<HTMLElement> {
  product: Product;
}

export function ProductCard({ product, className, ...props }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const initialUrl = primaryImage?.url || (product as any).imageUrl || "/images/products/shell-cone-pink-crackle-bracelet.webp";
  const [imgSrc, setImgSrc] = React.useState<string>(initialUrl);

  React.useEffect(() => {
    setImgSrc(initialUrl);
  }, [initialUrl]);

  const productUrl = `/shop/${product.category_slug}/${product.slug}`;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-md border border-border bg-surface p-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_-8px_rgba(45,26,22,0.18)] hover:border-gold-deep/40 motion-reduce:hover:translate-y-0",
        className
      )}
      {...props}
    >
      {/* 4:5 Aspect Ratio Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-bg">
        <Image
          src={imgSrc}
          alt={primaryImage?.alt || product.name}
          width={primaryImage?.width || 800}
          height={primaryImage?.height || 1000}
          onError={() => setImgSrc("/images/products/shell-cone-pink-crackle-bracelet.webp")}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
        />

        {/* Badges Overlay */}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {product.fulfilment_type === "made_to_order" ? (
            <Badge variant="outline" className="bg-surface/90 text-[10px] backdrop-blur-sm">
              Made to Order
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px]">
              In Stock
            </Badge>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="mt-3.5 flex flex-1 flex-col justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-rose-deep">
            {product.category_name}
          </p>
          <h3 className="mt-1 font-serif text-lg font-medium leading-snug text-cocoa">
            <Link
              href={productUrl}
              className="rounded-sm outline-none transition-colors hover:text-rose-deep focus-visible:ring-2 focus-visible:ring-ring"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-cocoa-muted">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between gap-2">
            <Price
              paise={product.price_minor}
              compareAtPaise={product.compare_at_price_minor ?? undefined}
              isDevPrice={product.is_dev_price}
            />

            <Button
              asChild
              variant="secondary"
              size="sm"
              className="border-cocoa/20 text-xs font-medium hover:border-rose-deep hover:bg-rose-deep hover:text-ivory"
            >
              <Link href={productUrl}>View Item</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
