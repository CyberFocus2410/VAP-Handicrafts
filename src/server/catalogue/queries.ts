import "server-only";
import { getSupabaseAnonClient } from "@/server/db/supabase";
import { SEED_PRODUCTS, type Product as SeedProduct } from "@/data/seed-products";
import {
  listCmsProducts,
  listCmsCategories,
  type CmsProduct,
} from "@/server/admin/cms-service";
import {
  type Category,
  type ProductDetail,
  type CatalogueFilter,
  CatalogueFilterSchema,
} from "./types";

const STATIC_CATEGORIES: Category[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    slug: "shell-jewellery",
    name: "Shell Jewellery",
    description: "Handcrafted shell bracelets, matching earrings, and delicate accessories made with natural ocean shells.",
    imageUrl: "/images/products/shell-cone-pink-crackle-bracelet.webp",
    parentId: null,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    slug: "personalized-cards",
    name: "Personalized Cards",
    description: "Relationship licence cards, Polaroid photo cards, and custom romantic dedications.",
    imageUrl: "/images/templates/relationship-licence-template.webp",
    parentId: null,
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    slug: "personalized-gifts",
    name: "Personalized Gifts",
    description: "Custom photo prints, relationship cards, and memories preserved forever.",
    imageUrl: "/images/products/golden-link-cowrie-charm-bracelet.webp",
    parentId: null,
    displayOrder: 3,
    isActive: true,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    slug: "cards-and-gifts",
    name: "Cards & Gifts",
    description: "Artfully packaged gifts for birthdays, anniversaries, and milestones.",
    imageUrl: "/images/products/scallop-cowrie-earring-bracelet-set.webp",
    parentId: null,
    displayOrder: 4,
    isActive: true,
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    slug: "return-favors",
    name: "Festive & Return Favors",
    description: "Charming tokens of gratitude for weddings, ceremonies, and milestone celebrations.",
    imageUrl: "/images/products/purple-floral-beaded-pearl-set.webp",
    parentId: null,
    displayOrder: 4,
    isActive: true,
  },
];

function mapSeedProductToDetail(p: SeedProduct): ProductDetail {
  const primaryVar = p.variants[0];
  return {
    id: p.id,
    categoryId: "10000000-0000-4000-8000-000000000001",
    categorySlug: p.category_slug,
    categoryName: p.category_name,
    slug: p.slug,
    name: p.name,
    description: p.description,
    status: p.status,
    fulfilmentType: p.fulfilment_type,
    materials: p.materials,
    dimensions: p.dimensions,
    isBestseller: true,
    isNewArrival: false,
    variants: p.variants.map((v) => ({
      id: v.id.length === 36 ? v.id : `00000000-0000-4000-8000-00000000000${v.sku.slice(-1) || "1"}`,
      productId: p.id,
      name: v.name,
      sku: v.sku,
      priceMinor: v.price_minor,
      compareAtPriceMinor: p.compare_at_price_minor,
      stockQuantity: p.stock_quantity,
      isDevPrice: p.is_dev_price,
      inStock: v.in_stock,
      attributes: {},
    })),
    images: p.images.map((img, idx) => ({
      id: `30000000-0000-4000-8000-00000000000${idx + 1}`,
      productId: p.id,
      url: img.url,
      alt: img.alt,
      width: img.width,
      height: img.height,
      displayOrder: idx + 1,
      isPrimary: img.is_primary,
    })),
    priceMinor: primaryVar?.price_minor ?? p.price_minor,
    compareAtPriceMinor: p.compare_at_price_minor,
    isDevPrice: p.is_dev_price,
    inStock: p.stock_quantity > 0,
  };
}

function mapCmsProductToDetail(p: CmsProduct): ProductDetail {
  return {
    id: p.id,
    categoryId: null,
    categorySlug: p.categorySlug,
    categoryName: p.categoryName,
    slug: p.slug,
    name: p.name,
    description: p.description,
    status: p.status,
    fulfilmentType: p.fulfilmentType,
    materials: p.materials ? p.materials.split(",").map((s) => s.trim()) : [],
    dimensions: p.dimensions || null,
    isBestseller: p.isBestseller ?? false,
    isNewArrival: p.isNewArrival ?? false,
    variants: [
      {
        id: `var-${p.id}`,
        productId: p.id,
        name: "Standard",
        sku: `VAP-${p.slug.toUpperCase().slice(0, 10)}`,
        priceMinor: p.priceMinor,
        compareAtPriceMinor: p.compareAtPriceMinor || null,
        stockQuantity: p.stockQuantity,
        isDevPrice: false,
        inStock: p.inStock,
        attributes: {},
      },
    ],
    images: [
      {
        id: `img-${p.id}`,
        productId: p.id,
        url: p.imageUrl,
        alt: p.imageAlt || p.name,
        width: 800,
        height: 1000,
        displayOrder: 1,
        isPrimary: true,
      },
    ],
    priceMinor: p.priceMinor,
    compareAtPriceMinor: p.compareAtPriceMinor || null,
    isDevPrice: false,
    inStock: p.inStock,
  };
}

/**
 * Lists all active categories (CMS-backed).
 */
export async function listCategories(): Promise<Category[]> {
  try {
    const cmsCats = await listCmsCategories();
    if (cmsCats && cmsCats.length > 0) {
      return cmsCats
        .filter((c) => c.isActive)
        .map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description,
          imageUrl: c.imageUrl,
          parentId: null,
          displayOrder: c.displayOrder,
          isActive: c.isActive,
        }));
    }
  } catch {
    // Fallback if error
  }

  return STATIC_CATEGORIES;
}

/**
 * Retrieves a category by slug.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await listCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

/**
 * Lists products matching filter, sorting, and pagination parameters (CMS & Supabase unified).
 */
export async function listProducts(
  filterParams?: Partial<CatalogueFilter>
): Promise<{
  products: ProductDetail[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const filter = CatalogueFilterSchema.parse(filterParams ?? {});

  let products: ProductDetail[] = [];

  // 1. Fetch from CMS store (which includes live-edited and seeded products)
  try {
    const cmsList = await listCmsProducts();
    if (cmsList && cmsList.length > 0) {
      products = cmsList
        .filter((p) => p.status === "active")
        .map(mapCmsProductToDetail);
    }
  } catch {
    // Non-fatal
  }

  // 2. Fallback to SEED_PRODUCTS if empty
  if (products.length === 0) {
    products = SEED_PRODUCTS.map(mapSeedProductToDetail);
  }

  // 3. Category Filter
  if (filter.categorySlug) {
    products = products.filter(
      (p) =>
        p.categorySlug === filter.categorySlug ||
        (filter.categorySlug === "jewellery" && p.categorySlug === "shell-jewellery") ||
        (filter.categorySlug === "personalized-cards" &&
          (p.categorySlug === "personalized-cards" || p.categorySlug === "personalized-gifts")) ||
        (filter.categorySlug === "personalized-gifts" &&
          (p.categorySlug === "personalized-cards" || p.categorySlug === "personalized-gifts"))
    );
  }

  // 4. Search Filter
  if (filter.search) {
    const q = filter.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.materials.some((m) => m.toLowerCase().includes(q))
    );
  }

  // 5. Price Filter
  if (typeof filter.minPriceMinor === "number") {
    products = products.filter((p) => p.priceMinor >= filter.minPriceMinor!);
  }
  if (typeof filter.maxPriceMinor === "number") {
    products = products.filter((p) => p.priceMinor <= filter.maxPriceMinor!);
  }
  if (filter.inStockOnly) {
    products = products.filter((p) => p.inStock);
  }

  // 6. Sort
  if (filter.sort === "price_asc") {
    products.sort((a, b) => a.priceMinor - b.priceMinor);
  } else if (filter.sort === "price_desc") {
    products.sort((a, b) => b.priceMinor - a.priceMinor);
  }

  const total = products.length;
  const start = (filter.page - 1) * filter.limit;
  const paged = products.slice(start, start + filter.limit);

  return {
    products: paged,
    total,
    page: filter.page,
    totalPages: Math.ceil(total / filter.limit) || 1,
  };
}

/**
 * Retrieves a single active product by slug.
 */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  // 1. Try CMS store
  try {
    const cmsList = await listCmsProducts();
    const cmsMatch = cmsList.find((p) => p.slug === slug && p.status === "active");
    if (cmsMatch) {
      return mapCmsProductToDetail(cmsMatch);
    }
  } catch {
    // Non-fatal
  }

  // 2. Try Supabase
  try {
    const supabase = getSupabaseAnonClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, categories!inner(slug, name), product_variants(*), product_images(*)")
      .eq("slug", slug)
      .eq("status", "active")
      .single();

    if (!error && data) {
      const variants = (data.product_variants || []).map((v: any) => ({
        id: v.id,
        productId: v.product_id,
        name: v.name,
        sku: v.sku,
        priceMinor: v.price_minor,
        compareAtPriceMinor: v.compare_at_price_minor,
        stockQuantity: v.stock_quantity,
        isDevPrice: v.is_dev_price,
        inStock: v.in_stock,
        attributes: v.attributes || {},
      }));

      const images = (data.product_images || []).map((img: any) => ({
        id: img.id,
        productId: img.product_id,
        url: img.url,
        alt: img.alt,
        width: img.width,
        height: img.height,
        displayOrder: img.display_order,
        isPrimary: img.is_primary,
      }));

      const primaryVar = variants[0];
      return {
        id: data.id,
        categoryId: data.category_id,
        categorySlug: data.categories?.slug || "shell-jewellery",
        categoryName: data.categories?.name || "Shell Jewellery",
        slug: data.slug,
        name: data.name,
        description: data.description,
        status: data.status,
        fulfilmentType: data.fulfilment_type,
        materials: data.materials || [],
        dimensions: data.dimensions,
        isBestseller: data.is_bestseller || false,
        isNewArrival: data.is_new_arrival || false,
        variants,
        images,
        priceMinor: primaryVar?.priceMinor ?? 0,
        compareAtPriceMinor: primaryVar?.compareAtPriceMinor,
        isDevPrice: primaryVar?.isDevPrice ?? true,
        inStock: (primaryVar?.stockQuantity ?? 1) > 0,
      };
    }
  } catch {
    // Fall back to seed data if error
  }

  // 3. Fallback to in-memory seed products
  const seed = SEED_PRODUCTS.find((p) => p.slug === slug);
  return seed ? mapSeedProductToDetail(seed) : null;
}
