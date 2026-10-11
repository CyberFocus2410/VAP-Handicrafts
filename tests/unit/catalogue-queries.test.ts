import { describe, it, expect, vi } from "vitest";

// Mock server-only so Vitest runs server components and queries cleanly
vi.mock("server-only", () => ({}));

import {
  listCategories,
  getCategoryBySlug,
  listProducts,
  getProductBySlug,
} from "@/server/catalogue/queries";
import { assertValidPaise } from "@/lib/money";

describe("Catalogue Queries (Data-Access Layer)", () => {
  it("listCategories returns all active categories", async () => {
    const categories = await listCategories();
    expect(categories.length).toBeGreaterThanOrEqual(2);
    const slugs = categories.map((c) => c.slug);
    expect(slugs).toContain("shell-jewellery");
    expect(slugs).toContain("personalized-cards");
  });

  it("getCategoryBySlug retrieves existing category and handles unknown slugs", async () => {
    const shellCategory = await getCategoryBySlug("shell-jewellery");
    expect(shellCategory).not.toBeNull();
    expect(shellCategory?.name).toBe("Shell Jewellery");

    const nonExistent = await getCategoryBySlug("non-existent-category");
    expect(nonExistent).toBeNull();
  });

  it("listProducts returns products with valid integer paise pricing and stock", async () => {
    const result = await listProducts();
    expect(result.products.length).toBeGreaterThan(0);
    expect(result.total).toBe(result.products.length);
    expect(result.page).toBe(1);

    for (const product of result.products) {
      expect(() => assertValidPaise(product.priceMinor)).not.toThrow();
      expect(product.slug).toBeTruthy();
      expect(product.images.length).toBeGreaterThan(0);
      expect(product.variants.length).toBeGreaterThan(0);
    }
  });

  it("listProducts correctly filters by category", async () => {
    const result = await listProducts({ categorySlug: "shell-jewellery" });
    expect(result.products.length).toBeGreaterThan(0);
    for (const product of result.products) {
      expect(product.categorySlug).toBe("shell-jewellery");
    }
  });

  it("listProducts correctly filters by inStock status", async () => {
    const result = await listProducts({ inStockOnly: true });
    expect(result.products.length).toBeGreaterThan(0);
    for (const product of result.products) {
      expect(product.inStock).toBe(true);
    }
  });

  it("listProducts correctly searches matching keywords", async () => {
    const result = await listProducts({ search: "cowrie" });
    expect(result.products.length).toBeGreaterThan(0);
    for (const product of result.products) {
      const match =
        product.name.toLowerCase().includes("cowrie") ||
        product.description.toLowerCase().includes("cowrie") ||
        product.materials.some((m) => m.toLowerCase().includes("cowrie"));
      expect(match).toBe(true);
    }
  });

  it("listProducts sorts by price asc and desc properly", async () => {
    const ascResult = await listProducts({ sort: "price_asc" });
    for (let i = 0; i < ascResult.products.length - 1; i++) {
      const current = ascResult.products[i];
      const next = ascResult.products[i + 1];
      expect(current).toBeDefined();
      expect(next).toBeDefined();
      if (current && next) {
        expect(current.priceMinor).toBeLessThanOrEqual(next.priceMinor);
      }
    }

    const descResult = await listProducts({ sort: "price_desc" });
    for (let i = 0; i < descResult.products.length - 1; i++) {
      const current = descResult.products[i];
      const next = descResult.products[i + 1];
      expect(current).toBeDefined();
      expect(next).toBeDefined();
      if (current && next) {
        expect(current.priceMinor).toBeGreaterThanOrEqual(next.priceMinor);
      }
    }
  });

  it("getProductBySlug retrieves product detail by valid slug", async () => {
    const product = await getProductBySlug("spiral-conch-pink-crackle-bracelet");
    expect(product).not.toBeNull();
    expect(product?.name).toContain("Spiral Conch");
    expect(product?.slug).toBe("spiral-conch-pink-crackle-bracelet");
    expect(product?.images.length).toBeGreaterThan(0);
    expect(product?.variants.length).toBeGreaterThan(0);
    expect(product?.materials.length).toBeGreaterThan(0);
  });

  it("getProductBySlug returns null for invalid slug without throwing", async () => {
    const product = await getProductBySlug("non-existent-product-slug");
    expect(product).toBeNull();
  });
});
