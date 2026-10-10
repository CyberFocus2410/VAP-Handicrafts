import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { SEED_PRODUCTS } from "@/data/seed-products";
import { assertValidPaise } from "@/lib/money";

describe("Phase 2 Seed Products & Photography Integrity", () => {
  it("contains exactly 4 authentic products matching the supplied jewellery photos", () => {
    expect(SEED_PRODUCTS).toHaveLength(4);
  });

  it("stores all prices as strict positive integer paise (no floats)", () => {
    for (const product of SEED_PRODUCTS) {
      expect(() => assertValidPaise(product.price_minor)).not.toThrow();
      expect(product.price_minor).toBeGreaterThan(0);
      expect(Number.isInteger(product.price_minor)).toBe(true);

      if (product.compare_at_price_minor !== null) {
        expect(() => assertValidPaise(product.compare_at_price_minor)).not.toThrow();
        expect(product.compare_at_price_minor).toBeGreaterThan(product.price_minor);
      }
    }
  });

  it("flags all initial products with is_dev_price: true until owner approves final catalogue rates", () => {
    for (const product of SEED_PRODUCTS) {
      expect(product.is_dev_price).toBe(true);
    }
  });

  it("verifies that all referenced product image files exist on the filesystem", () => {
    for (const product of SEED_PRODUCTS) {
      expect(product.images.length).toBeGreaterThan(0);
      for (const img of product.images) {
        // img.url is like "/images/products/...", which maps to "public/images/products/..."
        const relativePath = img.url.replace(/^\//, "");
        const absolutePath = path.resolve("public", relativePath.replace(/^public\//, ""));
        expect(
          fs.existsSync(absolutePath),
          `Missing image file: ${absolutePath}`
        ).toBe(true);
      }
    }
  });

  it("ensures descriptive, grounded alt text is provided for every image", () => {
    for (const product of SEED_PRODUCTS) {
      for (const img of product.images) {
        expect(img.alt.length).toBeGreaterThan(20);
        // Ensure no placeholder or fake terms are used
        expect(img.alt.toLowerCase()).not.toContain("placeholder");
        expect(img.alt.toLowerCase()).not.toContain("stock");
      }
    }
  });

  it("ensures each product has at least one valid variant with in-stock status", () => {
    for (const product of SEED_PRODUCTS) {
      expect(product.variants.length).toBeGreaterThan(0);
      for (const variant of product.variants) {
        expect(variant.sku).toMatch(/^VAP-[A-Z]+-\d{3}-[A-Z0-9]+$/);
        expect(() => assertValidPaise(variant.price_minor)).not.toThrow();
        expect(variant.in_stock).toBe(true);
      }
    }
  });
});
