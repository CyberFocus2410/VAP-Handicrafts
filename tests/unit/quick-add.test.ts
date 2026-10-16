import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/lib/cart/cart-store";
import { SEED_PRODUCTS } from "@/data/seed-products";

describe("Quick Add to Cart Feature", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.getState().closeDrawer();
  });

  it("adds a product quickly to cart and automatically opens the cart drawer", () => {
    const product = SEED_PRODUCTS[0]!;
    expect(product).toBeDefined();

    const store = useCartStore.getState();
    expect(store.items.length).toBe(0);
    expect(store.isDrawerOpen).toBe(false);

    // Simulate Quick Add
    const variantId = product.variants?.[0]?.id || "var-default";
    const lineId = store.addItem({
      productId: product.id,
      productSlug: product.slug,
      variantId,
      quantity: 1,
    });

    expect(lineId).toBeTruthy();

    const updated = useCartStore.getState();
    expect(updated.items.length).toBe(1);
    expect(updated.items[0]?.productId).toBe(product.id);
    expect(updated.items[0]?.quantity).toBe(1);
    expect(updated.isDrawerOpen).toBe(true);
  });

  it("increments quantity and keeps single line when quick-adding the same product repeatedly", () => {
    const product = SEED_PRODUCTS[0]!;
    const variantId = product.variants?.[0]?.id || "var-default";

    const store = useCartStore.getState();
    store.addItem({
      productId: product.id,
      productSlug: product.slug,
      variantId,
      quantity: 1,
    });

    store.addItem({
      productId: product.id,
      productSlug: product.slug,
      variantId,
      quantity: 1,
    });

    const state = useCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0]?.quantity).toBe(2);
  });

  it("adds distinct category products into distinct lines", () => {
    const prod1 = SEED_PRODUCTS[0]!;
    const prod2 = SEED_PRODUCTS[1]!;

    const store = useCartStore.getState();
    store.addItem({
      productId: prod1.id,
      productSlug: prod1.slug,
      variantId: prod1.variants?.[0]?.id || "var-default-1",
      quantity: 1,
    });

    store.addItem({
      productId: prod2.id,
      productSlug: prod2.slug,
      variantId: prod2.variants?.[0]?.id || "var-default-2",
      quantity: 1,
    });

    const state = useCartStore.getState();
    expect(state.items.length).toBe(2);
    expect(state.getItemCount()).toBe(2);
  });
});
