import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// 1. REFUSE TO RUN IN PRODUCTION (PRD §18 / RULES.md)
if (process.env.NODE_ENV === "production" || process.env.APP_ENV === "production") {
  console.error("⛔ FATAL: Database seed script is strictly forbidden in production.");
  process.exit(1);
}

// 2. Load .env.local
const envLocalPath = path.resolve(".env.local");
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment or .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

const CATEGORIES = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    slug: "shell-jewellery",
    name: "Shell Jewellery",
    description: "Handcrafted shell bracelets, matching earrings, and delicate accessories made with natural ocean shells.",
    display_order: 1,
    is_active: true,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    slug: "personalized-gifts",
    name: "Personalized Keepsakes",
    description: "Custom Polaroid photo cards, heartfelt keepsake frames, and memories preserved forever.",
    display_order: 2,
    is_active: true,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    slug: "keepsakes",
    name: "Cards & Gifts",
    description: "Artfully packaged gifts for birthdays, anniversaries, and milestones.",
    display_order: 3,
    is_active: true,
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    slug: "return-favors",
    name: "Festive & Return Favors",
    description: "Charming tokens of gratitude for weddings, ceremonies, and milestone celebrations.",
    display_order: 4,
    is_active: true,
  },
];

const PRODUCTS = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    category_id: "10000000-0000-4000-8000-000000000001",
    slug: "spiral-conch-pink-crackle-bracelet",
    name: "Spiral Conch & Pink Crackle Bead Bracelet",
    description: "Handcrafted elastic bracelet featuring natural striped spiral cone sea shells alternating with faceted translucent pink crackle glass beads. Arranged on a durable strand for everyday seaside elegance.",
    status: "active",
    fulfilment_type: "made_to_order",
    materials: ["Natural cone shells", "Crackle glass beads", "Durable elastic cord"],
    dimensions: "Standard 7-inch wrist fit (stretchable)",
    is_bestseller: true,
    is_new_arrival: false,
    variants: [
      {
        id: "20000000-0000-4000-8000-000000000001",
        name: "Standard Fit (7 inch)",
        sku: "VAP-BRAC-001-STD",
        price_minor: 69900,
        compare_at_price_minor: 89900,
        stock_quantity: 12,
        is_dev_price: true,
        in_stock: true,
        attributes: { size: "Standard 7-inch" },
      },
      {
        id: "20000000-0000-4000-8000-000000000002",
        name: "Petite Fit (6.25 inch)",
        sku: "VAP-BRAC-001-PET",
        price_minor: 69900,
        compare_at_price_minor: 89900,
        stock_quantity: 8,
        is_dev_price: true,
        in_stock: true,
        attributes: { size: "Petite 6.25-inch" },
      },
    ],
    images: [
      {
        id: "30000000-0000-4000-8000-000000000001",
        url: "/images/products/shell-cone-pink-crackle-bracelet.webp",
        alt: "Handcrafted circular bracelet with natural striped cone sea shells alternating with pink crackle glass beads on ivory stone pedestal",
        width: 896,
        height: 1200,
        display_order: 1,
        is_primary: true,
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    category_id: "10000000-0000-4000-8000-000000000001",
    slug: "scallop-cowrie-earring-bracelet-set",
    name: "Scallop Shell & Cowrie Earring-Bracelet Set",
    description: "Curated gift set pairing a fan scallop shell bracelet cradling rose crackle beads with matching gold-tone drop earrings featuring cowrie shell pendants, fan shell accents, and gold spacer beads.",
    status: "active",
    fulfilment_type: "made_to_order",
    materials: ["Natural scallop bivalves", "White cowrie shells", "Rose glass beads", "Gold-tone fishhooks"],
    dimensions: "Bracelet: 7 inch; Earrings: 2.5 inch drop",
    is_bestseller: true,
    is_new_arrival: true,
    variants: [
      {
        id: "20000000-0000-4000-8000-000000000003",
        name: "Complete Matching Set",
        sku: "VAP-SET-002-FULL",
        price_minor: 129900,
        compare_at_price_minor: 159900,
        stock_quantity: 8,
        is_dev_price: true,
        in_stock: true,
        attributes: { set_type: "Bracelet + Drop Earrings" },
      },
    ],
    images: [
      {
        id: "30000000-0000-4000-8000-000000000002",
        url: "/images/products/scallop-cowrie-earring-bracelet-set.webp",
        alt: "Handcrafted jewellery set with scallop shell and pink crackle bead bracelet paired with matching gold-tone cowrie drop earrings",
        width: 952,
        height: 1280,
        display_order: 1,
        is_primary: true,
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    category_id: "10000000-0000-4000-8000-000000000001",
    slug: "lavender-floral-beaded-pearl-set",
    name: "Lavender Floral Beaded & Pearl Set",
    description: "Delicate handcrafted gift set featuring a purple flower cluster beaded bracelet with gold center accents and clear quartz rondelles, accompanied by elegant drop earrings with faceted purple crystals and baroque white pearls.",
    status: "active",
    fulfilment_type: "made_to_order",
    materials: ["Seed beads", "Faceted crystals", "Baroque faux pearls", "Gold-plated findings"],
    dimensions: "Bracelet: 6.5–7.5 inch (adjustable with clasp); Earrings: 2.25 inch drop",
    is_bestseller: false,
    is_new_arrival: true,
    variants: [
      {
        id: "20000000-0000-4000-8000-000000000004",
        name: "Full Set (Bracelet + Earrings)",
        sku: "VAP-SET-003-LAV",
        price_minor: 119900,
        compare_at_price_minor: 139900,
        stock_quantity: 10,
        is_dev_price: true,
        in_stock: true,
        attributes: { set_type: "Bracelet + Earrings" },
      },
    ],
    images: [
      {
        id: "30000000-0000-4000-8000-000000000003",
        url: "/images/products/purple-floral-beaded-pearl-set.webp",
        alt: "Handcrafted purple floral beaded bracelet with gold center beads and matching drop earrings featuring purple crystals and baroque pearls",
        width: 606,
        height: 867,
        display_order: 1,
        is_primary: true,
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    category_id: "10000000-0000-4000-8000-000000000001",
    slug: "golden-link-cowrie-conch-charm-bracelet",
    name: "Golden Link Cowrie & Conch Charm Bracelet",
    description: "Golden link chain bracelet adorned with natural seaside treasures: alternating polished ivory cowrie shells and brown-striped spiral conch shells suspended with sturdy jump rings and secure lobster clasp.",
    status: "active",
    fulfilment_type: "made_to_order",
    materials: ["Natural cowrie shells", "Natural spiral shells", "Gold-toned brass chain", "Lobster clasp"],
    dimensions: "7.5 inch length with 1 inch extender chain",
    is_bestseller: false,
    is_new_arrival: false,
    variants: [
      {
        id: "20000000-0000-4000-8000-000000000005",
        name: "Standard Link with Extender",
        sku: "VAP-BRAC-004-GLD",
        price_minor: 79900,
        compare_at_price_minor: 99900,
        stock_quantity: 15,
        is_dev_price: true,
        in_stock: true,
        attributes: { chain: "Gold-tone brass link" },
      },
    ],
    images: [
      {
        id: "30000000-0000-4000-8000-000000000004",
        url: "/images/products/golden-link-cowrie-charm-bracelet.webp",
        alt: "Handcrafted gold-tone link charm bracelet with dangling polished white cowrie and brown striped spiral shell charms on beach sand",
        width: 873,
        height: 621,
        display_order: 1,
        is_primary: true,
      },
    ],
  },
];

async function runSeed() {
  console.log("Starting database seeding for VAP Handicrafts...");

  // 1. Seed Categories
  console.log("Seeding categories...");
  for (const cat of CATEGORIES) {
    const { error } = await supabase.from("categories").upsert(cat, { onConflict: "slug" });
    if (error) {
      console.warn(`Category upsert notice for ${cat.slug}: ${error.message}`);
    }
  }

  // 2. Seed Products, Variants, and Images
  console.log("Seeding products...");
  for (const prod of PRODUCTS) {
    const { variants, images, ...productData } = prod;

    const { error: prodError } = await supabase.from("products").upsert(productData, { onConflict: "slug" });
    if (prodError) {
      console.warn(`Product upsert notice for ${prod.slug}: ${prodError.message}`);
      continue;
    }

    for (const v of variants) {
      const { error: vError } = await supabase.from("product_variants").upsert({
        ...v,
        product_id: prod.id,
      }, { onConflict: "sku" });
      if (vError) {
        console.warn(`Variant upsert notice for ${v.sku}: ${vError.message}`);
      }
    }

    for (const img of images) {
      const { error: imgError } = await supabase.from("product_images").upsert({
        ...img,
        product_id: prod.id,
      }, { onConflict: "id" });
      if (imgError) {
        console.warn(`Image upsert notice: ${imgError.message}`);
      }
    }
  }

  // 3. Seed Site Settings
  console.log("Seeding site settings...");
  await supabase.from("site_settings").upsert([
    {
      key: "announcement",
      value: { text: "Handcrafted seaside gifts delivered across India · Free shipping on orders above ₹999", is_active: true },
      is_public: true,
    },
    {
      key: "brand",
      value: { name: "VAP Handicrafts", tagline: "Little treasures, made to be loved" },
      is_public: true,
    },
  ], { onConflict: "key" });

  console.log("✅ Database seeding complete!");
}

runSeed().catch((err) => {
  console.error("Seed execution failed:", err);
  process.exit(1);
});
