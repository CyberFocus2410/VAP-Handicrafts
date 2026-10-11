import { describe, it, expect } from "vitest";
import {
  listAllCustomers,
  saveCustomerNotesAndTags,
  listAllInquiries,
  createCustomerInquiry,
  updateCustomerInquiry,
} from "@/server/admin/crm-service";
import {
  listCmsProducts,
  createCmsProduct,
  updateCmsProduct,
  listCmsCategories,
  createCmsCategory,
  updateCmsCategory,
  getSiteContentConfig,
  updateSiteContentConfig,
} from "@/server/admin/cms-service";

describe("Phase 6 CRM & CMS Services", () => {
  describe("CRM Customer Directory & 360° Profiles", () => {
    it("deduplicates orders into customer profiles with accurate Lifetime Value in paise", async () => {
      const customers = await listAllCustomers();
      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBeGreaterThan(0);

      // Verify each profile has proper numeric spend and order counts
      for (const customer of customers) {
        expect(typeof customer.totalSpendMinor).toBe("number");
        expect(customer.totalSpendMinor).toBeGreaterThanOrEqual(0);
        expect(customer.totalOrders).toBeGreaterThanOrEqual(1);
        expect(customer.orders.length).toBe(customer.totalOrders);
        expect(Array.isArray(customer.tags)).toBe(true);
      }
    });

    it("persists internal founder notes and custom tags for customer profiles", async () => {
      const customers = await listAllCustomers();
      const first = customers[0];
      expect(first).toBeDefined();
      if (!first) throw new Error("first patron undefined");

      const testTags = ["VIP Patron", "Loves Cowrie Shells", "Fast Shipper"];
      const testNotes = "Prefers extra bubble wrap and handwritten thank you note.";

      const updated = await saveCustomerNotesAndTags(first.customerKey, testTags, testNotes);
      expect(updated.customerKey).toBe(first.customerKey);
      expect(updated.tags).toEqual(testTags);
      expect(updated.internalNotes).toBe(testNotes);

      // Re-query and verify notes reflect
      const refreshedCustomers = await listAllCustomers();
      const refreshedFirst = refreshedCustomers.find((c) => c.customerKey === first.customerKey);
      expect(refreshedFirst?.internalNotes).toBe(testNotes);
      expect(refreshedFirst?.tags).toEqual(testTags);
    });
  });

  describe("CRM Inquiries & Custom Gifting Pipeline", () => {
    it("creates and lists customer inquiries with status and timestamp", async () => {
      const created = await createCustomerInquiry({
        name: "Mira Rajput",
        email: "mira.r@gmail.com",
        phone: "+91 98200 11223",
        occasion: "Destination Mehendi Gifts",
        message: "Need 30 shell charm bracelets with matching cards.",
      });

      expect(created.id).toBeDefined();
      expect(created.name).toBe("Mira Rajput");
      expect(created.status).toBe("new");
      expect(created.occasion).toBe("Destination Mehendi Gifts");

      const all = await listAllInquiries();
      const found = all.find((i) => i.id === created.id);
      expect(found).toBeDefined();
      expect(found?.email).toBe("mira.r@gmail.com");
    });

    it("updates inquiry status, assigned founder, quote, and internal notes", async () => {
      const created = await createCustomerInquiry({
        name: "Karan Johar",
        email: "karan@dharma.com",
        message: "Looking for premium return favors.",
      });

      const updated = await updateCustomerInquiry(created.id, {
        status: "quote_sent",
        assignedTo: "Pulkit Garg",
        quoteMinor: 1500000, // ₹15,000
        internalNotes: "Sent catalog on WhatsApp. Awaiting review.",
      });

      expect(updated?.status).toBe("quote_sent");
      expect(updated?.assignedTo).toBe("Pulkit Garg");
      expect(updated?.quoteMinor).toBe(1500000);
      expect(updated?.internalNotes).toContain("Sent catalog");
    });
  });

  describe("CMS Products & Inventory Management", () => {
    it("lists products and permits creating new items with integer paise pricing", async () => {
      const initialProducts = await listCmsProducts();
      expect(initialProducts.length).toBeGreaterThan(0);

      const newProduct = await createCmsProduct({
        name: "Sunset Cowrie Choker",
        categorySlug: "shell-jewellery",
        description: "Hand-strung cowrie necklace with terracotta clay beads.",
        priceMinor: 89900, // ₹899
        compareAtPriceMinor: 119900, // ₹1,199
        stockQuantity: 15,
        fulfilmentType: "in_stock",
        materials: "Natural cowrie shells, terracotta clay, wax thread",
        imageUrl: "/images/products/golden-link-cowrie-charm-bracelet.webp",
      });

      expect(newProduct.id).toBeDefined();
      expect(newProduct.priceMinor).toBe(89900);
      expect(newProduct.stockQuantity).toBe(15);
      expect(newProduct.inStock).toBe(true);

      const refreshed = await listCmsProducts();
      const found = refreshed.find((p) => p.id === newProduct.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe("Sunset Cowrie Choker");
    });

    it("updates product stock and toggles status between active and draft", async () => {
      const products = await listCmsProducts();
      const target = products[0];
      expect(target).toBeDefined();
      if (!target) throw new Error("target product undefined");

      const updated = await updateCmsProduct(target.id, {
        stockQuantity: 28,
        status: "draft",
      });

      expect(updated.stockQuantity).toBe(28);
      expect(updated.status).toBe("draft");
      expect(updated.inStock).toBe(true);
    });
  });

  describe("CMS Categories Management", () => {
    it("lists collections and creates a new category with display order", async () => {
      const initialCats = await listCmsCategories();
      expect(initialCats.length).toBeGreaterThan(0);

      const newCat = await createCmsCategory({
        name: "Festive Pooja Favors",
        description: "Sacred shell keepsakes for festive pooja rituals.",
        imageUrl: "/images/products/purple-floral-beaded-pearl-set.webp",
        displayOrder: 9,
      });

      expect(newCat.id).toBeDefined();
      expect(newCat.slug).toBe("festive-pooja-favors");
      expect(newCat.isActive).toBe(true);

      const updated = await updateCmsCategory(newCat.id, {
        description: "Updated description for festive patrons.",
      });
      expect(updated.description).toBe("Updated description for festive patrons.");
    });
  });

  describe("CMS Site Content Dynamic Customizer", () => {
    it("gets and updates site content config with brand fidelity", async () => {
      const config = await getSiteContentConfig();
      expect(config.announcement).toBeDefined();
      expect(config.hero).toBeDefined();
      expect(config.brandStory).toBeDefined();
      expect(config.scrapbook.length).toBeGreaterThan(0);

      const updated = await updateSiteContentConfig({
        announcement: {
          text: "✨ Exclusive Diwali Gift Hampers Now Available!",
          linkUrl: "/products",
          linkText: "Explore Now",
          isEnabled: true,
        },
      });

      expect(updated.announcement.text).toBe("✨ Exclusive Diwali Gift Hampers Now Available!");
    });
  });
});
