import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/lib/cart/cart-store";
import { areCustomizationsEqual } from "@/lib/cart/types";

describe("Phase 4 Client Cart Store & Customization Integrity", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it("adds an item to the cart and calculates item count correctly", () => {
    const store = useCartStore.getState();
    const lineId = store.addItem({
      productId: "prod-001",
      productSlug: "spiral-conch-pink-crackle-bracelet",
      variantId: "var-001",
      quantity: 1,
    });

    expect(lineId).toBeTruthy();
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().getItemCount()).toBe(1);
  });

  it("increments quantity when identical item with identical customization is added", () => {
    const store = useCartStore.getState();
    store.addItem({
      productId: "prod-001",
      productSlug: "spiral-conch-pink-crackle-bracelet",
      variantId: "var-001",
      quantity: 1,
    });

    store.addItem({
      productId: "prod-001",
      productSlug: "spiral-conch-pink-crackle-bracelet",
      variantId: "var-001",
      quantity: 2,
    });

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]?.quantity).toBe(3);
    expect(useCartStore.getState().getItemCount()).toBe(3);
  });

  it("PRD §9.4: creates two independent line items when same product has different customizations", () => {
    const store = useCartStore.getState();

    // Line 1: Gift for Ananya
    const line1Id = store.addItem({
      productId: "prod-001",
      productSlug: "spiral-conch-pink-crackle-bracelet",
      variantId: "var-001",
      quantity: 1,
      customization: {
        recipientName: "Ananya",
        caption: "Goa 2026",
      },
    });

    // Line 2: Gift for Rhea
    const line2Id = store.addItem({
      productId: "prod-001",
      productSlug: "spiral-conch-pink-crackle-bracelet",
      variantId: "var-001",
      quantity: 1,
      customization: {
        recipientName: "Rhea",
        caption: "Birthday Memories",
      },
    });

    expect(line1Id).not.toBe(line2Id);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(2);

    // Verify independent line data
    const line1 = items.find((i) => i.lineId === line1Id);
    const line2 = items.find((i) => i.lineId === line2Id);

    expect(line1?.customization?.recipientName).toBe("Ananya");
    expect(line2?.customization?.recipientName).toBe("Rhea");

    // Editing line 1 does not affect line 2
    store.updateQuantity(line1Id, 3);
    expect(useCartStore.getState().items.find((i) => i.lineId === line1Id)?.quantity).toBe(3);
    expect(useCartStore.getState().items.find((i) => i.lineId === line2Id)?.quantity).toBe(1);

    // Removing line 1 leaves line 2 intact
    store.removeItem(line1Id);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]?.lineId).toBe(line2Id);
  });

  it("areCustomizationsEqual helper accurately distinguishes customized gifts", () => {
    expect(areCustomizationsEqual(undefined, undefined)).toBe(true);
    expect(areCustomizationsEqual({ recipientName: "A" }, { recipientName: "A" })).toBe(true);
    expect(areCustomizationsEqual({ recipientName: "A" }, { recipientName: "B" })).toBe(false);
    expect(areCustomizationsEqual({ recipientName: "A" }, undefined)).toBe(false);
  });

  it("removes line item when quantity is decremented to zero or below", () => {
    const store = useCartStore.getState();
    const lineId = store.addItem({
      productId: "prod-001",
      productSlug: "spiral-conch-pink-crackle-bracelet",
      variantId: "var-001",
      quantity: 1,
    });

    expect(useCartStore.getState().items).toHaveLength(1);
    store.updateQuantity(lineId, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
