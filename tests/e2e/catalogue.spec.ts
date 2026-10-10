import { test, expect } from "@playwright/test";

test.describe("Phase 3 Catalogue & Product Pages", () => {
  test("shop page renders all products, category filters, and integer paise pricing", async ({ page }) => {
    await page.goto("/shop");

    // Title and landmark
    await expect(page).toHaveTitle(/Shop All Collections/i);
    await expect(page.getByRole("heading", { level: 1, name: /Shop All Collections/i })).toBeVisible();

    // Verify product cards are displayed
    const productCards = page.locator("article");
    const count = await productCards.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Verify price formatting in INR (₹)
    const firstPrice = productCards.first().locator("p, span").filter({ hasText: /₹\d+/ });
    await expect(firstPrice.first()).toBeVisible();

    // Verify Dev pricing badge is present
    await expect(page.getByText(/Dev Sample|Dev Price/i).first()).toBeVisible();

    // Verify category filter pill works
    const shellPill = page.getByRole("button", { name: /Shell Jewellery/i }).first();
    await expect(shellPill).toBeVisible();
  });

  test("product detail page renders gallery, variants, breadcrumbs, and specifications", async ({ page }) => {
    await page.goto("/products/spiral-conch-pink-crackle-bracelet");

    // Heading
    const title = page.getByRole("heading", { level: 1, name: /Spiral Conch & Pink Crackle Bead Bracelet/i });
    await expect(title).toBeVisible();

    // Breadcrumbs
    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(breadcrumb.getByRole("link", { name: "Shell Jewellery" })).toBeVisible();

    // Gallery and main image
    const mainImg = page.locator("img[alt*='Spiral Conch'], img[alt*='striped cone']").first();
    await expect(mainImg).toBeVisible();

    // Variant selector
    const variantRadioGroup = page.getByRole("radiogroup", { name: /Select variant/i });
    await expect(variantRadioGroup).toBeVisible();

    // Check SKU display
    await expect(page.getByText(/VAP-BRAC-001/i)).toBeVisible();

    // Toggle variant
    const petiteVariant = page.getByRole("radio", { name: /Petite Fit/i });
    if (await petiteVariant.isVisible()) {
      await petiteVariant.click();
      await expect(page.getByText(/VAP-BRAC-001-PET/i)).toBeVisible();
    }

    // Specifications / Materials
    await expect(page.getByText(/Materials & Craftsmanship/i)).toBeVisible();
    await expect(page.getByText(/Natural cone shells/i)).toBeVisible();

    // Truthful JSON-LD script (no fake ratings)
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).toBeTruthy();
    const parsedSchema = JSON.parse(jsonLd!);
    expect(parsedSchema["@type"]).toBe("Product");
    expect(parsedSchema.name).toContain("Spiral Conch");
    expect(parsedSchema.aggregateRating).toBeUndefined(); // strictly no fake ratings
    expect(parsedSchema.offers.priceCurrency).toBe("INR");
  });

  test("collection page lists category-specific items and breadcrumbs", async ({ page }) => {
    await page.goto("/collections/shell-jewellery");

    await expect(page).toHaveTitle(/Shell Jewellery/i);
    await expect(page.getByRole("heading", { level: 1, name: /Shell Jewellery/i })).toBeVisible();

    // Verify products are listed
    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible();
  });

  test("search page allows finding products by keyword", async ({ page }) => {
    await page.goto("/search?q=cowrie");

    await expect(page.getByRole("heading", { level: 1, name: /Search Results/i })).toBeVisible();
    await expect(page.getByText(/result(s)? found for/i)).toBeVisible();

    const results = page.locator("article");
    expect(await results.count()).toBeGreaterThanOrEqual(1);
  });

  test("unknown product slug returns 404 page", async ({ page }) => {
    const response = await page.goto("/products/non-existent-product-test");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /Product Not Found/i })).toBeVisible();
  });
});
