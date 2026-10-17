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
    // Authoritative price is 19900 (₹199), NOT 100 paise
    expect(line?.priceMinor).toBe(19900);
    expect(line?.subtotalMinor).toBe(19900);
    expect(result.subtotalMinor).toBe(19900);
    expect(() => assertValidPaise(result.totalMinor)).not.toThrow();
  });

  it("applies standard shipping when subtotal is below ₹999 threshold", async () => {
    const cart = [
      {
        lineId: "line-01",
        productId: "00000000-0000-4000-8000-000000000001",
        productSlug: "spiral-conch-pink-crackle-bracelet",
        variantId: "var-001-standard",
        quantity: 1, // ₹199 (19900 paise < 99900 paise)
      },
    ];

    const result = await validateAndPriceCart(cart);

    expect(result.subtotalMinor).toBe(19900);
    expect(result.shippingMinor).toBe(9900); // ₹99 shipping
    expect(result.totalMinor).toBe(19900 + 9900); // ₹298
    expect(result.amountNeededForFreeShippingMinor).toBe(80000); // ₹800 needed
  });

  it("unlocks FREE shipping when subtotal meets or exceeds ₹999 threshold", async () => {
    const cart = [
      {
        lineId: "line-02",
        productId: "00000000-0000-4000-8000-000000000002",
        productSlug: "scallop-cowrie-earring-bracelet-set",
        variantId: "var-002-set",
        quantity: 4, // 4 * ₹299 = ₹1,196 (119600 paise > 99900 paise)
      },
    ];

    const result = await validateAndPriceCart(cart);

    expect(result.subtotalMinor).toBe(119600);
    expect(result.shippingMinor).toBe(0); // Free shipping
    expect(result.totalMinor).toBe(119600);
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

  it("calculates freebie unlock progress when subtotal is below minimum order threshold", async () => {
    // 1 item worth ₹199 (19900 paise < 29900 paise min order)
    const cart = [
      {
        lineId: "line-01",
        productId: "00000000-0000-4000-8000-000000000001",
        productSlug: "spiral-conch-pink-crackle-bracelet",
        variantId: "var-001-standard",
        quantity: 1,
      },
    ];

    const result = await validateAndPriceCart(cart);

    expect(result.freebie).toBeDefined();
    if (result.freebie) {
      expect(result.freebie.isUnlocked).toBe(false);
      expect(result.freebie.minOrderMinor).toBe(29900);
      expect(result.freebie.amountNeededMinor).toBe(10000); // ₹100 more to unlock ₹149 gift
      expect(result.freebie.percentage).toBeLessThan(100);
    }
    // Cart should only have 1 regular line, no freebie injected yet
    expect(result.lines.some((l) => l.isFreebie)).toBe(false);
  });

  it("automatically injects ₹0 freebie item when cart reaches minimum order threshold of ₹299", async () => {
    // 2 items worth ₹199 = ₹398 (39800 paise >= 29900 paise)
    const cart = [
      {
        lineId: "line-01",
        productId: "00000000-0000-4000-8000-000000000001",
        productSlug: "spiral-conch-pink-crackle-bracelet",
        variantId: "var-001-standard",
        quantity: 2,
      },
    ];

    const result = await validateAndPriceCart(cart);

    expect(result.freebie).toBeDefined();
    expect(result.freebie?.isUnlocked).toBe(true);
    expect(result.freebie?.amountNeededMinor).toBe(0);
    expect(result.freebie?.percentage).toBe(100);

    // Freebie item must be auto-injected with ₹0 price and ₹149 compareAt value
    const freebieLine = result.lines.find((l) => l.isFreebie);
    expect(freebieLine).toBeDefined();
    expect(freebieLine?.priceMinor).toBe(0);
    expect(freebieLine?.productName).toContain("Shell Charm Keepsake");

    // Total must only reflect the real items + shipping, zero charge for freebie
    expect(result.subtotalMinor).toBe(39800);
  });
});
