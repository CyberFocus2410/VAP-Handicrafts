import "server-only";
import crypto from "crypto";
import { SEED_PRODUCTS, type Product as SeedProduct } from "@/data/seed-products";
import { getSupabaseAdminClient } from "@/server/db/supabase";
import {
  SiteContentConfig,
  SiteAnnouncementContent,
  SiteHeroContent,
  SiteBrandStoryContent,
  SiteScrapbookItem,
} from "./crm-cms-types";

export interface CmsProduct {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  description: string;
  priceMinor: number;
  compareAtPriceMinor?: number;
  stockQuantity: number;
  inStock: boolean;
  fulfilmentType: "in_stock" | "made_to_order";
  materials: string;
  dimensions?: string;
  imageUrl: string;
  imageAlt: string;
  status: "active" | "draft" | "archived";
  isBestseller?: boolean;
  isNewArrival?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CmsCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
}

// In-memory persistent stores with globalThis singleton pattern
const globalWithCMS = globalThis as typeof globalThis & {
  __vapCmsProducts?: Map<string, CmsProduct>;
  __vapCmsCategories?: Map<string, CmsCategory>;
  __vapSiteContent?: SiteContentConfig;
};

const productsStore: Map<string, CmsProduct> =
  globalWithCMS.__vapCmsProducts ?? (globalWithCMS.__vapCmsProducts = new Map());

const categoriesStore: Map<string, CmsCategory> =
  globalWithCMS.__vapCmsCategories ?? (globalWithCMS.__vapCmsCategories = new Map());

// Initialize categories store from base seed
const DEFUNCT_CMS_CATEGORY_SLUGS = new Set([
  "return-favors",
  "festive-return-favors",
  "cards-and-gifts",
  "personalized-gifts",
  "personalized-keepsakes",
  "keepsakes",
  "giftsets",
  "gift-sets",
]);

// Purge any defunct or duplicate categories on reload
for (const [id, cat] of categoriesStore.entries()) {
  if (
    id === "cat-1" ||
    id === "cat-2" ||
    DEFUNCT_CMS_CATEGORY_SLUGS.has(cat.slug) ||
    cat.name.toLowerCase().includes("festive") ||
    cat.name.toLowerCase().includes("favor")
  ) {
    categoriesStore.delete(id);
  }
}

if (categoriesStore.size === 0) {
  const initialCategories: CmsCategory[] = [
    {
      id: "10000000-0000-4000-8000-000000000001",
      slug: "shell-jewellery",
      name: "Shell Jewellery",
      description: "Handcrafted shell bracelets, matching earrings, and delicate accessories made with natural ocean shells.",
      imageUrl: "/images/products/shell-cone-pink-crackle-bracelet.webp",
      displayOrder: 1,
      isActive: true,
    },
    {
      id: "10000000-0000-4000-8000-000000000002",
      slug: "personalized-cards",
      name: "Personalized Cards",
      description: "Relationship licence cards, Polaroid photo cards, and custom romantic dedications.",
      imageUrl: "https://qepfiubmjueooacemhzz.supabase.co/storage/v1/object/public/product-media/products/1791746730434-0zu5u2.png",
      displayOrder: 2,
      isActive: true,
    },
  ];
  for (const cat of initialCategories) {
    categoriesStore.set(cat.id, cat);
  }
}

// Initialize products store from SEED_PRODUCTS if empty
if (productsStore.size === 0) {
  for (const p of SEED_PRODUCTS) {
    const primaryVar = p.variants[0];
    const cmsProd: CmsProduct = {
      id: p.id,
      slug: p.slug,
      name: p.name,
      categorySlug: p.category_slug,
      categoryName: p.category_name,
      description: p.description,
      priceMinor: primaryVar ? primaryVar.price_minor : 49900,
      compareAtPriceMinor: p.compare_at_price_minor ?? undefined,
      stockQuantity: p.stock_quantity,
      inStock: p.stock_quantity > 0,
      fulfilmentType: p.fulfilment_type === "made_to_order" ? "made_to_order" : "in_stock",
      materials: Array.isArray(p.materials) ? p.materials.join(", ") : (p.materials || ""),
      dimensions: p.dimensions,
      imageUrl: p.images[0]?.url || "/images/products/shell-cone-pink-crackle-bracelet.webp",
      imageAlt: p.images[0]?.alt || p.name,
      status: p.status === "archived" ? "archived" : "active",
      isBestseller: true,
      isNewArrival: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    productsStore.set(cmsProd.id, cmsProd);
  }
}

// Default site content
const DEFAULT_SITE_CONTENT: SiteContentConfig = {
  announcement: {
    text: "✨ Handcrafted in India • Free Delivery Across India on Orders Above ₹999 • WhatsApp Support Available",
    linkUrl: "/products",
    linkText: "Shop New Arrivals",
    isEnabled: true,
  },
  hero: {
    eyebrow: "Artisanal Ocean Shell Jewellery & Custom Keepsakes",
    title: "Handmade Treasures,",
    italicTitlePart: "Crafted with Love.",
    description: "Discover authentic cowrie shell jewellery, matching earring sets, and custom personalized photo cards designed to preserve your sweetest milestones forever.",
    primaryCtaText: "Explore Collection",
    primaryCtaLink: "/products",
    secondaryCtaText: "Personalize a Card",
    secondaryCtaLink: "/products/relationship-licence-card",
  },
  brandStory: {
    eyebrow: "Our Heritage & Craftsmanship",
    heading: "Where Coastal Artistry Meets Meaningful Gifting",
    highlightPhrase: "Every piece tells an ocean-born story.",
    narrativeParagraph1: "Founded by Pulkit Garg & Vivan Mittal, VAP Handicrafts was born out of a profound love for natural coastal elements and intimate memories. From hand-selected cowrie and conch shells gathered along pristine Indian shores to intricate hand-threaded beads and bespoke relationship licence cards, each piece is shaped with unwavering attention to detail.",
    narrativeParagraph2: "We believe a truly memorable gift isn't mass-produced in a factory—it is thoughtfully assembled by caring hands, packed with handwritten notes, and treasured across lifetimes.",
    badgeTitle: "100% Handcrafted in India",
    badgeSubtitle: "Ethically Sourced Natural Shells & Archival Cardstock",
  },
  scrapbook: [
    {
      id: "sb-1",
      title: "Handcrafted Cowrie Charm",
      subtitle: "Ocean-harvested cowrie shells paired with 18k gold-finish links",
      imageUrl: "/images/products/golden-link-cowrie-charm-bracelet.webp",
    },
    {
      id: "sb-2",
      title: "Relationship Licence Card",
      subtitle: "Personalized couple anniversary keepsake with high-res photo",
      imageUrl: "/images/templates/relationship-licence-template.webp",
    },
    {
      id: "sb-3",
      title: "Cone Shell Pink Crackle Set",
      subtitle: "Natural cone shells threaded with pink crackle quartz accents",
      imageUrl: "/images/products/shell-cone-pink-crackle-bracelet.webp",
    },
    {
      id: "sb-4",
      title: "Scallop & Cowrie Earring Set",
      subtitle: "Delicate shell drop earrings handcrafted for festive celebrations",
      imageUrl: "/images/products/scallop-cowrie-earring-bracelet-set.webp",
    },
  ],
};

let siteContentStore: SiteContentConfig =
  globalWithCMS.__vapSiteContent ?? (globalWithCMS.__vapSiteContent = DEFAULT_SITE_CONTENT);

// High-Concurrency Traffic Shield: 20s TTL protects database during surges
let lastProductsFetchTime = 0;
const PRODUCTS_CACHE_TTL_MS = 20_000;

let lastCategoriesFetchTime = 0;
const CATEGORIES_CACHE_TTL_MS = 60_000;

/* -------------------------------------------------------------------------- */
/*                               Product API                                  */
/* -------------------------------------------------------------------------- */

export async function listCmsProducts(): Promise<CmsProduct[]> {
  const now = Date.now();
  // Under sudden high traffic (e.g. 1,000 users browsing together), serve from memory store
  // if synced within TTL. This shields database connections and delivers sub-millisecond responses.
  if (productsStore.size > 0 && now - lastProductsFetchTime < PRODUCTS_CACHE_TTL_MS) {
    return Array.from(productsStore.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: dbProducts } = await supabase
      .from("products")
      .select("*, categories(name, slug), product_variants(*), product_images(*)")
      .order("created_at", { ascending: false });

    if (dbProducts && dbProducts.length > 0) {
      lastProductsFetchTime = now;
      // Sync into CMS store
      for (const p of dbProducts) {
        const primaryVar = p.product_variants?.[0];
        const primaryImg = p.product_images?.[0];
        const existing = productsStore.get(p.id);
        const mapped: CmsProduct = {
          id: p.id,
          slug: p.slug,
          name: p.name,
          categorySlug: p.categories?.slug || "shell-jewellery",
          categoryName: p.categories?.name || "Shell Jewellery",
          description: p.description || "",
          priceMinor: primaryVar ? primaryVar.price_minor : (existing?.priceMinor ?? 49900),
          compareAtPriceMinor: primaryVar?.compare_at_price_minor ?? existing?.compareAtPriceMinor,
          stockQuantity: primaryVar ? primaryVar.stock_quantity : (existing?.stockQuantity ?? 10),
          inStock: primaryVar ? primaryVar.stock_quantity > 0 : true,
          fulfilmentType: p.fulfilment_type === "made_to_order" ? "made_to_order" : "in_stock",
          materials: p.materials || "",
          dimensions: p.dimensions || undefined,
          imageUrl: primaryImg?.url || existing?.imageUrl || "/images/products/shell-cone-pink-crackle-bracelet.webp",
          imageAlt: primaryImg?.alt || p.name,
          status: p.status || "active",
          isBestseller: existing?.isBestseller ?? true,
          isNewArrival: existing?.isNewArrival ?? false,
          createdAt: p.created_at || new Date().toISOString(),
          updatedAt: p.updated_at || new Date().toISOString(),
        };
        productsStore.set(mapped.id, mapped);
      }
    }
  } catch {
    // Non-fatal fallback to in-memory store
  }

  return Array.from(productsStore.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function createCmsProduct(input: {
  name: string;
  slug?: string;
  categorySlug: string;
  description: string;
  priceMinor: number;
  compareAtPriceMinor?: number;
  stockQuantity: number;
  fulfilmentType: "in_stock" | "made_to_order";
  materials: string;
  dimensions?: string;
  imageUrl: string;
  status?: "active" | "draft" | "archived";
}): Promise<CmsProduct> {
  const id = crypto.randomUUID();
  const slug =
    input.slug ||
    input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const category = Array.from(categoriesStore.values()).find(
    (c) => c.slug === input.categorySlug
  );
  const categoryName = category ? category.name : "Shell Jewellery";

  const newProduct: CmsProduct = {
    id,
    slug,
    name: input.name,
    categorySlug: input.categorySlug,
    categoryName,
    description: input.description,
    priceMinor: input.priceMinor,
    compareAtPriceMinor: input.compareAtPriceMinor,
    stockQuantity: input.stockQuantity,
    inStock: input.stockQuantity > 0,
    fulfilmentType: input.fulfilmentType,
    materials: input.materials,
    dimensions: input.dimensions,
    imageUrl: input.imageUrl,
    imageAlt: input.name,
    status: input.status || "active",
    isBestseller: false,
    isNewArrival: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  productsStore.set(id, newProduct);
  lastProductsFetchTime = 0;

  // Attempt Supabase insert if available
  try {
    const supabase = getSupabaseAdminClient();
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", input.categorySlug)
      .maybeSingle();

    await supabase.from("products").insert({
      id,
      name: input.name,
      slug,
      category_id: cat?.id ?? null,
      description: input.description,
      fulfilment_type: input.fulfilmentType,
      materials: input.materials,
      dimensions: input.dimensions,
      status: input.status || "active",
    });

    await supabase.from("product_variants").insert({
      product_id: id,
      name: "Default",
      sku: `VAP-${slug.slice(0, 8).toUpperCase()}`,
      price_minor: input.priceMinor,
      compare_at_price_minor: input.compareAtPriceMinor,
      stock_quantity: input.stockQuantity,
      in_stock: input.stockQuantity > 0,
    });

    await supabase.from("product_images").insert({
      product_id: id,
      url: input.imageUrl,
      alt: input.name,
      width: 800,
      height: 1000,
      display_order: 1,
      is_primary: true,
    });
  } catch {
    // Non-fatal fallback
  }

  return newProduct;
}

export async function updateCmsProduct(
  id: string,
  patch: Partial<Omit<CmsProduct, "id" | "createdAt">>
): Promise<CmsProduct> {
  const existing = productsStore.get(id);
  if (!existing) {
    throw new Error(`Product with ID "${id}" not found.`);
  }

  const updated: CmsProduct = {
    ...existing,
    ...patch,
    stockQuantity: patch.stockQuantity !== undefined ? patch.stockQuantity : existing.stockQuantity,
    inStock:
      patch.stockQuantity !== undefined
        ? patch.stockQuantity > 0
        : (patch.inStock !== undefined ? patch.inStock : existing.inStock),
    updatedAt: new Date().toISOString(),
  };

  productsStore.set(id, updated);
  lastProductsFetchTime = 0;

  // Sync to Supabase
  try {
    const supabase = getSupabaseAdminClient();
    await supabase
      .from("products")
      .update({
        name: updated.name,
        description: updated.description,
        fulfilment_type: updated.fulfilmentType,
        materials: updated.materials,
        dimensions: updated.dimensions,
        status: updated.status,
      })
      .eq("id", id);

    if (patch.priceMinor !== undefined || patch.stockQuantity !== undefined) {
      await supabase
        .from("product_variants")
        .update({
          price_minor: updated.priceMinor,
          stock_quantity: updated.stockQuantity,
          in_stock: updated.inStock,
        })
        .eq("product_id", id);
    }

    if (patch.imageUrl !== undefined) {
      const { data: existingImg } = await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", id)
        .order("is_primary", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingImg) {
        await supabase
          .from("product_images")
          .update({
            url: updated.imageUrl,
            alt: updated.name,
          })
          .eq("id", existingImg.id);
      } else {
        await supabase.from("product_images").insert({
          product_id: id,
          url: updated.imageUrl,
          alt: updated.name,
          width: 800,
          height: 1000,
          display_order: 1,
          is_primary: true,
        });
      }
    }
  } catch {
    // Non-fatal
  }

  return updated;
}

export async function deleteCmsProduct(id: string): Promise<boolean> {
  productsStore.delete(id);
  lastProductsFetchTime = 0;

  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("products").delete().eq("id", id);
  } catch {
    // Non-fatal
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/*                              Category API                                  */
/* -------------------------------------------------------------------------- */

export async function listCmsCategories(): Promise<CmsCategory[]> {
  const now = Date.now();
  if (categoriesStore.size > 0 && now - lastCategoriesFetchTime < CATEGORIES_CACHE_TTL_MS) {
    const seen = new Set<string>();
    const cleanList: CmsCategory[] = [];
    for (const c of Array.from(categoriesStore.values()).sort((a, b) => a.displayOrder - b.displayOrder)) {
      const normSlug = c.slug.toLowerCase().trim();
      const normName = c.name.toLowerCase().trim();
      if (
        DEFUNCT_CMS_CATEGORY_SLUGS.has(normSlug) ||
        normName.includes("festive") ||
        normName.includes("favor") ||
        normName.includes("keepsake") ||
        seen.has(normSlug)
      ) {
        continue;
      }
      seen.add(normSlug);
      cleanList.push(c);
    }
    return cleanList;
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: dbCats } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (dbCats && dbCats.length > 0) {
      lastCategoriesFetchTime = now;
      for (const c of dbCats) {
        const normSlug = c.slug?.toLowerCase().trim() || "";
        const normName = c.name?.toLowerCase().trim() || "";
        if (
          DEFUNCT_CMS_CATEGORY_SLUGS.has(normSlug) ||
          normName.includes("festive") ||
          normName.includes("favor") ||
          normName.includes("keepsake")
        ) {
          continue;
        }

        // Deduplicate: replace any mock/temp entry with the DB entry
        for (const [existingId, existingCat] of categoriesStore.entries()) {
          if (existingCat.slug === c.slug && existingId !== c.id) {
            categoriesStore.delete(existingId);
          }
        }

        categoriesStore.set(c.id, {
          id: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description || "",
          imageUrl: c.image_url || "/images/products/shell-cone-pink-crackle-bracelet.webp",
          displayOrder: c.display_order ?? 1,
          isActive: c.is_active ?? true,
        });
      }
    }
  } catch {
    // Non-fatal
  }

  // Deduplicate before returning
  const seen = new Set<string>();
  const cleanList: CmsCategory[] = [];
  for (const c of Array.from(categoriesStore.values()).sort((a, b) => a.displayOrder - b.displayOrder)) {
    const normSlug = c.slug.toLowerCase().trim();
    const normName = c.name.toLowerCase().trim();
    if (
      DEFUNCT_CMS_CATEGORY_SLUGS.has(normSlug) ||
      normName.includes("festive") ||
      normName.includes("favor") ||
      normName.includes("keepsake") ||
      seen.has(normSlug)
    ) {
      continue;
    }
    seen.add(normSlug);
    cleanList.push(c);
  }

  return cleanList;
}

export async function createCmsCategory(input: {
  name: string;
  slug?: string;
  description: string;
  imageUrl: string;
  displayOrder?: number;
}): Promise<CmsCategory> {
  const id = crypto.randomUUID();
  const slug =
    input.slug ||
    input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const newCat: CmsCategory = {
    id,
    slug,
    name: input.name,
    description: input.description,
    imageUrl: input.imageUrl,
    displayOrder: input.displayOrder ?? categoriesStore.size + 1,
    isActive: true,
  };

  categoriesStore.set(id, newCat);
  lastCategoriesFetchTime = 0;

  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("categories").insert({
      id,
      name: newCat.name,
      slug: newCat.slug,
      description: newCat.description,
      image_url: newCat.imageUrl,
      display_order: newCat.displayOrder,
      is_active: newCat.isActive,
    });
  } catch {
    // Non-fatal
  }

  return newCat;
}

export async function updateCmsCategory(
  id: string,
  patch: Partial<Omit<CmsCategory, "id">>
): Promise<CmsCategory> {
  const existing = categoriesStore.get(id);
  if (!existing) {
    throw new Error(`Category with ID "${id}" not found.`);
  }

  const updated: CmsCategory = {
    ...existing,
    ...patch,
  };

  categoriesStore.set(id, updated);
  lastCategoriesFetchTime = 0;

  try {
    const supabase = getSupabaseAdminClient();
    await supabase
      .from("categories")
      .update({
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        image_url: updated.imageUrl,
        display_order: updated.displayOrder,
        is_active: updated.isActive,
      })
      .eq("id", id);
  } catch {
    // Non-fatal
  }

  return updated;
}

/* -------------------------------------------------------------------------- */
/*                            Site Content CMS                                */
/* -------------------------------------------------------------------------- */

export async function getSiteContentConfig(): Promise<SiteContentConfig> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data: rows } = await supabase
      .from("site_content_settings")
      .select("key, value");

    if (rows && rows.length > 0) {
      for (const row of rows) {
        if (row.key === "announcement") {
          siteContentStore.announcement = row.value as SiteAnnouncementContent;
        } else if (row.key === "hero") {
          siteContentStore.hero = row.value as SiteHeroContent;
        } else if (row.key === "brandStory") {
          siteContentStore.brandStory = row.value as SiteBrandStoryContent;
        } else if (row.key === "scrapbook") {
          siteContentStore.scrapbook = row.value as SiteScrapbookItem[];
        }
      }
    }
  } catch {
    // Non-fatal fallback
  }

  return siteContentStore;
}

export async function updateSiteContentConfig(
  patch: Partial<SiteContentConfig>
): Promise<SiteContentConfig> {
  siteContentStore = {
    ...siteContentStore,
    ...patch,
  };
  globalWithCMS.__vapSiteContent = siteContentStore;

  try {
    const supabase = getSupabaseAdminClient();
    const entries = Object.entries(patch);
    for (const [key, value] of entries) {
      await supabase.from("site_content_settings").upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });
    }
  } catch {
    // Non-fatal
  }

  return siteContentStore;
}
