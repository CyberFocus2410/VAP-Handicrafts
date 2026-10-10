import { test, expect } from "@playwright/test";

test.describe("Phase 4 Cart & Personalization Experience", () => {
  test("adds product to cart from detail page, opens drawer, and updates quantities", async ({ page }) => {
    await page.goto("/products/spiral-conch-pink-crackle-bracelet");

    // Click Add to Cart
    const addToCartBtn = page.getByRole("button", { name: /Add to Cart/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Verify slide-over cart drawer opens
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expect(page.getByRole("heading", { name: /Your Shopping Bag/i })).toBeVisible();

    // Verify product in drawer
    await expect(drawer.getByText(/Spiral Conch & Pink Crackle/i)).toBeVisible();
    await expect(drawer.getByText(/₹699/).first()).toBeVisible();

    // Increment quantity via + button
    const plusBtn = drawer.getByRole("button", { name: /Increase quantity/i });
    await expect(plusBtn).toBeVisible();
    await plusBtn.click();

    // Verify quantity updated to 2 and subtotal updated to ₹1,398
    await expect(drawer.getByText(/₹1,398/).first()).toBeVisible();

    // Close drawer via close button
    const closeBtn = drawer.getByRole("button", { name: /Close cart drawer/i });
    await closeBtn.click();
    await expect(drawer).not.toBeVisible();

    // Verify header cart badge shows 2
    const headerCartBtn = page.getByRole("button", { name: /View shopping cart with 2 items/i });
    await expect(headerCartBtn).toBeVisible();
  });

  test("personalization flow captures custom text, updates live preview, and adds customized line to cart", async ({ page }) => {
    await page.goto("/personalize/spiral-conch-pink-crackle-bracelet");

    // Verify heading
    await expect(page.getByRole("heading", { name: /Customize for Your Favourite Person/i })).toBeVisible();

    // Switch to Handcrafted Keepsake Gift Note template
    const keepsakeTemplateBtn = page.getByRole("button", { name: /Handcrafted Keepsake Gift Note/i });
    await keepsakeTemplateBtn.click();

    // Fill in personalization fields
    const recipientInput = page.getByLabel(/Recipient Name/i);
    await recipientInput.fill("Ananya");

    const messageInput = page.getByLabel(/Personal Message/i);
    await messageInput.fill("Happy Birthday! Wishing you warmth and joy.");

    // Verify live preview updates with entered text
    await expect(page.getByText(/Dear Ananya/i)).toBeVisible();
    await expect(page.getByRole("paragraph").filter({ hasText: /Happy Birthday/i })).toBeVisible();

    // Add customized piece to cart
    const addCustomBtn = page.getByRole("button", { name: /Add Customized Piece to Cart/i });
    await expect(addCustomBtn).toBeEnabled();
    await addCustomBtn.click();

    // Verify cart drawer opens with personalization summary pill
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/Personalized Keepsake/i)).toBeVisible();
    await expect(drawer.getByText(/Ananya/i).first()).toBeVisible();
  });

  test("full cart page renders line items, shipping breakdown, and allows checkout navigation", async ({ page }) => {
    // Start with clean session
    await page.goto("/shop");

    // Add first item
    await page.goto("/products/spiral-conch-pink-crackle-bracelet");
    await page.getByRole("button", { name: /Add to Cart/i }).click();

    // Navigate to /cart
    await page.goto("/cart");
    await expect(page).toHaveTitle(/Shopping Cart/i);

    // Verify line item and order summary
    await expect(page.getByRole("heading", { name: /Shopping Cart/i })).toBeVisible();
    await expect(page.getByText(/Order Summary/i)).toBeVisible();

    // Verify proceed to checkout button
    const checkoutBtn = page.getByRole("link", { name: /Proceed to Checkout/i });
    await expect(checkoutBtn).toBeVisible();
    await expect(checkoutBtn).toHaveAttribute("href", "/checkout");

    // Remove item from cart
    const removeBtn = page.getByRole("button", { name: /Remove .* from cart/i }).first();
    await removeBtn.click();

    // Verify empty state
    await expect(page.getByRole("heading", { name: /Your Cart is Empty/i })).toBeVisible();
  });
});
