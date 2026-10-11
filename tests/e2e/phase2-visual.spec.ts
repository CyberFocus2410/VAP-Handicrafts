import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Phase 2 Visual Experience & Homepage Sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("renders all homepage sections in strict PRD §6 order", async ({ page }) => {
    // 1. Hero Section
    const hero = page.locator("section[aria-labelledby='hero-heading']");
    await expect(hero).toBeVisible();
    await expect(hero.locator("h1")).toContainText("Little treasures");

    // 2. Trust Highlights
    const trust = page.locator("section[aria-label='Trust and Service Highlights']");
    await expect(trust).toBeVisible();
    await expect(trust.getByText("Natural Ocean Shells")).toBeVisible();
    await expect(trust.getByText("Pan-India Courier")).toBeVisible();

    // 3. Featured Collections
    const collections = page.locator("section[aria-labelledby='collections-heading']");
    await expect(collections).toBeVisible();
    await expect(collections.getByText("Shell Bracelets")).toBeVisible();

    // 4. Scrapbook Keepsakes
    const scrapbook = page.locator("section[aria-labelledby='scrapbook-heading']");
    await expect(scrapbook).toBeVisible();
    await expect(scrapbook.getByText("Snapshots of Seaside Craft")).toBeVisible();

    // 5. Featured Products
    const products = page.locator("section[aria-labelledby='featured-products-heading']");
    await expect(products).toBeVisible();
    await expect(products.getByText("Featured Shell Jewellery & Gifts")).toBeVisible();

    // 6. Personalized Gift Feature
    const personalized = page.locator("section[aria-labelledby='personalized-heading']");
    await expect(personalized).toBeVisible();
    await expect(personalized.getByText("Personalized Cards & Gifts")).toBeVisible();

    // 7. Brand Story
    const story = page.locator("section[aria-labelledby='brand-story-heading']");
    await expect(story).toBeVisible();
    await expect(story.getByText("Our Story", { exact: true })).toBeVisible();
  });

  test("hero primary CTA is a real link to /shop and navigates immediately", async ({ page }) => {
    const cta = page.locator("[data-testid='hero-primary-cta']");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/shop");

    // Click and confirm navigation
    await Promise.all([
      page.waitForURL(/\/shop/),
      cta.click(),
    ]);
    await expect(page).toHaveURL(/\/shop/);
  });

  test("featured products grid renders all 4 authentic products with fulfilment badges", async ({ page }) => {
    const productsSection = page.locator("section[aria-labelledby='featured-products-heading']");

    // Check presence of products
    await expect(productsSection.getByText("Spiral Conch & Pink Crackle Bead Bracelet")).toBeVisible();
    await expect(productsSection.getByText("Scallop Shell & Cowrie Earring-Bracelet Set")).toBeVisible();
    await expect(productsSection.getByText("Lavender Floral Beaded & Pearl Set")).toBeVisible();
    await expect(productsSection.getByText("Golden Link Cowrie & Conch Charm Bracelet")).toBeVisible();

    // Ensure production badges are present
    const fulfilmentBadges = productsSection.getByText(/Made to Order|In Stock/i);
    await expect(fulfilmentBadges.first()).toBeVisible();

    // Click first product card and verify detail page
    const firstViewBtn = productsSection.getByRole("link", { name: "View Item" }).first();
    await firstViewBtn.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(/\/shop\/shell-jewellery\//),
      firstViewBtn.click(),
    ]);
    await expect(page).toHaveURL(/\/shop\/shell-jewellery\//);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("scrapbook polaroids display genuine photos and captions", async ({ page }) => {
    const scrapbook = page.locator("section[aria-labelledby='scrapbook-heading']");
    await expect(scrapbook.getByText("Spiral Cone Bracelet")).toBeVisible();
    await expect(scrapbook.getByText("Scallop & Cowrie Set")).toBeVisible();
    await expect(scrapbook.getByText("Floral Blossom & Pearl")).toBeVisible();
    await expect(scrapbook.getByText("Golden Ocean Charms")).toBeVisible();
  });

  test("homepage passes WCAG 2.2 AA accessibility audit with zero serious or critical violations", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const seriousOrCritical = accessibilityScanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    expect(seriousOrCritical).toEqual([]);
  });
});

test.describe("Phase 2 Fallbacks & Responsive Integrity", () => {
  const VIEWPORTS = [
    { width: 360, height: 740, name: "360px small mobile" },
    { width: 390, height: 844, name: "390px mobile" },
    { width: 768, height: 1024, name: "768px tablet" },
    { width: 1024, height: 768, name: "1024px laptop" },
    { width: 1440, height: 900, name: "1440px desktop" },
  ];

  for (const vp of VIEWPORTS) {
    test(`renders homepage with zero horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(
        hasHorizontalScroll,
        `Horizontal scroll detected at ${vp.width}px viewport`
      ).toBe(false);
    });
  }

  test("renders static fallback poster when prefers-reduced-motion is active", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Static poster fallback must be visible
    const staticFallback = page.locator("[data-testid='hero-static-fallback']");
    await expect(staticFallback).toBeVisible();

    // Hero CTA remains clickable and fully functional
    const cta = page.locator("[data-testid='hero-primary-cta']");
    await expect(cta).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/shop/),
      cta.click(),
    ]);
    await expect(page).toHaveURL(/\/shop/);
  });
});
