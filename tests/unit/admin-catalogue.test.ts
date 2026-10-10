import { describe, it, expect } from "vitest";
import {
  AdminProductCreateInputSchema,
  CategorySchema,
  ProductVariantSchema,
} from "@/server/catalogue/types";

describe("Admin Catalogue Input Schemas & Integrity", () => {
  it("accepts valid admin product creation input", () => {
    const valid = {
      name: "Handcrafted Cowrie Shell Choker",
      slug: "handcrafted-cowrie-shell-choker",
      categorySlug: "shell-jewellery",
      description: "Authentic coastal cowrie choker handcrafted with sturdy natural cord.",
      fulfilmentType: "made_to_order" as const,
      materials: ["Natural Cowrie Shells", "Braided Cotton Cord"],
      dimensions: "35cm length with 5cm adjustable chain",
      priceMinor: 49900,
      compareAtPriceMinor: 69900,
      initialStock: 15,
      sku: "VAP-CHOKER-001-NAT",
      imageUrl: "/images/products/shell-cone-pink-crackle-bracelet.webp",
      imageAlt: "Authentic handcrafted cowrie choker with woven natural cord",
    };

    const parsed = AdminProductCreateInputSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("rejects non-integer or negative prices", () => {
    const invalidFloats = {
      name: "Handcrafted Cowrie Shell Choker",
      slug: "handcrafted-cowrie-shell-choker",
      categorySlug: "shell-jewellery",
      description: "Authentic coastal cowrie choker handcrafted with sturdy natural cord.",
      priceMinor: 499.5, // float rejected
      sku: "VAP-CHOKER-001",
      imageUrl: "/images/products/bracelet.webp",
      imageAlt: "Authentic coastal cowrie choker",
    };
    expect(AdminProductCreateInputSchema.safeParse(invalidFloats).success).toBe(false);

    const negativePrice = {
      ...invalidFloats,
      priceMinor: -100, // negative rejected
    };
    expect(AdminProductCreateInputSchema.safeParse(negativePrice).success).toBe(false);
  });

  it("rejects invalid slugs with uppercase or special characters", () => {
    const invalidSlug = {
      name: "Handcrafted Cowrie Shell Choker",
      slug: "Handcrafted_Cowrie_Choker!", // invalid characters
      categorySlug: "shell-jewellery",
      description: "Authentic coastal cowrie choker handcrafted with sturdy natural cord.",
      priceMinor: 49900,
      sku: "VAP-CHOKER-001",
      imageUrl: "/images/products/bracelet.webp",
      imageAlt: "Authentic coastal cowrie choker",
    };
    expect(AdminProductCreateInputSchema.safeParse(invalidSlug).success).toBe(false);
  });

  it("validates ProductVariant schema requiring UUID and integer paise", () => {
    const variant = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      productId: "123e4567-e89b-12d3-a456-426614174001",
      name: "Standard 7-inch",
      sku: "VAP-BRAC-001-7IN",
      priceMinor: 39900,
      compareAtPriceMinor: 54900,
      stockQuantity: 20,
      isDevPrice: true,
      inStock: true,
      attributes: { size: "7 inch" },
    };
    expect(ProductVariantSchema.safeParse(variant).success).toBe(true);
  });
});
