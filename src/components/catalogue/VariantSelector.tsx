"use client";

import * as React from "react";
import { type ProductVariant } from "@/server/catalogue/types";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string;
  onSelectVariant: (variant: ProductVariant) => void;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
}: VariantSelectorProps) {
  if (variants.length <= 1) {
    return null;
  }

  return (
    <div className="space-y-3" role="radiogroup" aria-label="Select variant">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-cocoa">Available Options:</span>
        <span className="text-cocoa-muted">{variants.length} options</span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {variants.map((v) => {
          const isSelected = v.id === selectedVariantId;
          const isOutOfStock = !v.inStock || (typeof v.stockQuantity === "number" && v.stockQuantity === 0);

          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(v)}
              className={cn(
                "group relative flex items-center gap-2 rounded-sm border px-3.5 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-rose-deep bg-blush/20 text-rose-deep font-semibold shadow-sm"
                  : "border-border bg-surface text-cocoa hover:border-cocoa/40",
                isOutOfStock && "opacity-50 cursor-not-allowed line-through"
              )}
            >
              <span>{v.name}</span>
              {isOutOfStock ? (
                <span className="text-[10px] text-error font-normal">(Sold out)</span>
              ) : (
                typeof v.stockQuantity === "number" &&
                v.stockQuantity > 0 &&
                v.stockQuantity <= 3 && (
                  <span className="text-[10px] text-rose-deep">({v.stockQuantity} left)</span>
                )
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
