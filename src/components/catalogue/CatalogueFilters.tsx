"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { type Category } from "@/server/catalogue/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CatalogueFiltersProps {
  categories: Category[];
  activeCategorySlug?: string;
  totalProducts: number;
}

export function CatalogueFilters({
  categories,
  activeCategorySlug,
  totalProducts,
}: CatalogueFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "featured";
  const inStockOnly = searchParams.get("inStock") === "true";

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (slug: string) => {
    if (slug === "all") {
      router.push("/shop");
    } else {
      router.push(`/collections/${slug}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
      {/* Category Pills / Select */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleCategoryChange("all")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            !activeCategorySlug
              ? "bg-rose-deep text-white font-semibold shadow-sm"
              : "border border-border bg-surface text-cocoa hover:border-cocoa/40"
          }`}
        >
          All Items ({totalProducts})
        </button>
        {categories.map((c) => {
          const isActive = activeCategorySlug === c.slug;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCategoryChange(c.slug)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-rose-deep text-white font-semibold shadow-sm"
                  : "border border-border bg-surface text-cocoa hover:border-cocoa/40"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Sorting & In-Stock Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="inStockFilter"
            checked={inStockOnly}
            onCheckedChange={(checked) => updateParam("inStock", checked ? "true" : null)}
          />
          <Label htmlFor="inStockFilter" className="text-xs text-cocoa cursor-pointer">
            In Stock Only
          </Label>
        </div>

        <div className="w-44">
          <Select
            value={currentSort}
            onValueChange={(val) => updateParam("sort", val === "featured" ? null : val)}
          >
            <SelectTrigger aria-label="Sort products by" className="h-8 text-xs bg-surface border-border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest Arrivals</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
