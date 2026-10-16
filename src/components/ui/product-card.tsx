"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { type Product } from "@/data/seed-products";
import { Price } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart/cart-store";
import { generateAutoAlt } from "@/lib/images/auto-alt";

export interface ProductCardProps extends React.HTMLAttributes<HTMLElement> {
  product: Product;
}

export function ProductCard({ product, className, ...props }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const initialUrl = primaryImage?.url || (product as any).imageUrl || "/images/products/shell-cone-pink-crackle-bracelet.webp";
  const [imgSrc, setImgSrc] = React.useState<string>(initialUrl);
  const [isAdded, setIsAdded] = React.useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  React.useEffect(() => {
    setImgSrc(initialUrl);
  }, [initialUrl]);

  const productUrl = `/shop/${product.category_slug}/${product.slug}`;

  const altText = generateAutoAlt({
    customText: primaryImage?.alt,
    name: product.name,
    category: product.category_name,
    type: "product",
  });

  const isOutOfStock =
    typeof product.stock_quantity === "number" && product.stock_quantity <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    const variantId = product.variants?.[0]?.id || "var-default";
    addItem({
      productId: product.id,
      productSlug: product.slug,
      variantId,
      quantity: 1,
    });

    openDrawer();
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2200);
  };

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
        <Link href={productUrl} className="block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Image
            src={imgSrc}
            alt={altText}
            width={primaryImage?.width || 800}
            height={primaryImage?.height || 1000}
            onError={() => setImgSrc("/images/products/shell-cone-pink-crackle-bracelet.webp")}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5 pointer-events-none">
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

        {/* Floating Quick Add Pill on Hover (Desktop) */}
        {!isOutOfStock && (
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={`Quick add ${product.name} to cart`}
            className={cn(
              "absolute bottom-2.5 right-2.5 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-all duration-300 backdrop-blur-md opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 active:scale-95",
              isAdded
                ? "bg-emerald-700 text-white"
                : "bg-surface/95 hover:bg-rose-deep hover:text-white text-cocoa border border-border/80"
            )}
          >
            {isAdded ? (
              <>
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        )}
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

            <div className="flex items-center gap-1.5">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-cocoa/20 text-xs font-medium hover:border-rose-deep hover:text-rose-deep px-2.5 h-8"
                title="View item details"
              >
                <Link href={productUrl}>View</Link>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleQuickAdd}
                disabled={isOutOfStock}
                className={cn(
                  "h-8 px-3 text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 active:scale-95",
                  isAdded
                    ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                    : "bg-rose-deep hover:bg-rose-deep/90 text-ivory"
                )}
                title={isOutOfStock ? "Out of Stock" : `Quick add ${product.name} to cart`}
              >
                {isAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Added</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Sold Out</span>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>+ Add</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
