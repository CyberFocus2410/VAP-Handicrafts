import { describe, it, expect } from "vitest";
import { validateAndPriceCart } from "@/server/cart/validator";
import { assertValidPaise } from "@/lib/money";

describe("Phase 4 Server Authoritative Cart Pricing & Validation", () => {
  it("ignores any client-side price tampering and fetches authoritative variant prices", async () => {
    const maliciousIntent = [
      {
        lineId: "line-hack-01",
        productId: "00000000-0000-4000-8000-000000000001",
        productSlug: "spiral-conch-pink-crackle-bracelet",
        variantId: "var-001-standard",
        quantity: 1,
        // Attempting to send manipulated fields in payload
        priceMinor: 100, // Client tries to pay ₹1 instead of ₹699
        subtotalMinor: 100,
      } as any,
    ];

    const result = await validateAndPriceCart(maliciousIntent);

    expect(result.valid).toBe(true);
    expect(result.lines).toHaveLength(1);

    const line = result.lines[0];
    // Authoritative price is 69900 (₹699), NOT 100 paise
    expect(line?.priceMinor).toBe(69900);
    expect(line?.subtotalMinor).toBe(69900);
    expect(result.subtotalMinor).toBe(69900);
    expect(() => assertValidPaise(result.totalMinor)).not.toThrow();
  });

  it("applies standard shipping when subtotal is below ₹999 threshold", async () => {
    const cart = [
      {
        lineId: "line-01",
        productId: "00000000-0000-4000-8000-000000000001",
        productSlug: "spiral-conch-pink-crackle-bracelet",
        variantId: "var-001-standard",
        quantity: 1, // ₹699 (69900 paise < 99900 paise)
      },
    ];

    const result = await validateAndPriceCart(cart);

    expect(result.subtotalMinor).toBe(69900);
    expect(result.shippingMinor).toBe(9900); // ₹99 shipping
    expect(result.totalMinor).toBe(69900 + 9900); // ₹798
    expect(result.amountNeededForFreeShippingMinor).toBe(30000); // ₹300 needed
  });

  it("unlocks FREE shipping when subtotal meets or exceeds ₹999 threshold", async () => {
    const cart = [
      {
        lineId: "line-02",
        productId: "00000000-0000-4000-8000-000000000002",
        productSlug: "scallop-cowrie-earring-bracelet-set",
        variantId: "var-002-set",
        quantity: 1, // ₹1,299 (129900 paise > 99900 paise)
      },
    ];

    const result = await validateAndPriceCart(cart);

    expect(result.subtotalMinor).toBe(129900);
    expect(result.shippingMinor).toBe(0); // Free shipping
    expect(result.totalMinor).toBe(129900);
    expect(result.amountNeededForFreeShippingMinor).toBe(0);
  });

  it("safely adjusts quantity if requested quantity exceeds available stock", async () => {
    const cart = [
      {
        lineId: "line-03",
        productId: "00000000-0000-4000-8000-000000000001",
        productSlug: "spiral-conch-pink-crackle-bracelet",
        variantId: "var-001-standard",
        quantity: 999, // Exceeds available stock of 12
      },
    ];

    const result = await validateAndPriceCart(cart);

    expect(result.lines[0]?.quantity).toBe(12);
    expect(result.notices.length).toBeGreaterThan(0);
    expect(result.notices[0]?.type).toBe("STOCK_ADJUSTED");
  });

  it("gracefully omits non-existent or invalid products with notice", async () => {
    const invalidCart = [
      {
        lineId: "line-bogus",
        productId: "fake-product-uuid",
        productSlug: "ghost-item-does-not-exist",
        variantId: "var-fake",
        quantity: 1,
      },
    ];

    const result = await validateAndPriceCart(invalidCart);

    expect(result.lines).toHaveLength(0);
    expect(result.subtotalMinor).toBe(0);
    expect(result.notices.length).toBeGreaterThan(0);
    expect(result.notices[0]?.type).toBe("OUT_OF_STOCK");
  });
});
