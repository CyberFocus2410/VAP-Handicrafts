export interface ProductImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price_minor: number;
  in_stock: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_slug: string;
  category_name: string;
  description: string;
  price_minor: number;
  compare_at_price_minor: number | null;
  is_dev_price: boolean;
  status: "active" | "draft" | "archived";
  stock_quantity: number;
  fulfilment_type: "in_stock" | "made_to_order";
  materials: string[];
  dimensions: string;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
}

export const SEED_PRODUCTS: Product[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Spiral Conch & Pink Crackle Bead Bracelet",
    slug: "spiral-conch-pink-crackle-bracelet",
    category_slug: "shell-jewellery",
    category_name: "Shell Jewellery",
    description:
      "Handcrafted elastic bracelet featuring natural striped spiral cone sea shells alternating with faceted translucent pink crackle glass beads. Arranged on a durable strand for everyday seaside elegance.",
    price_minor: 69900, // ₹699
    compare_at_price_minor: 89900, // ₹899
    is_dev_price: true,
    status: "active",
    stock_quantity: 12,
    fulfilment_type: "made_to_order",
    materials: ["Natural cone shells", "Crackle glass beads", "Durable elastic cord"],
    dimensions: "Standard 7-inch wrist fit (stretchable)",
    images: [
      {
        url: "/images/products/shell-cone-pink-crackle-bracelet.webp",
        alt: "Handcrafted circular bracelet with natural striped cone sea shells alternating with pink crackle glass beads on ivory stone pedestal",
        width: 896,
        height: 1200,
        is_primary: true,
      },
    ],
    variants: [
      {
        id: "var-001-standard",
        name: "Standard Fit (7 inch)",
        sku: "VAP-BRAC-001-STD",
        price_minor: 69900,
        in_stock: true,
      },
      {
        id: "var-001-petite",
        name: "Petite Fit (6.25 inch)",
        sku: "VAP-BRAC-001-PET",
        price_minor: 69900,
        in_stock: true,
      },
    ],
    tags: ["bracelet", "shells", "pink beads", "handcrafted"],
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Scallop Shell & Cowrie Earring-Bracelet Set",
    slug: "scallop-cowrie-earring-bracelet-set",
    category_slug: "shell-jewellery",
    category_name: "Shell Jewellery",
    description:
      "Curated gift set pairing a fan scallop shell bracelet cradling rose crackle beads with matching gold-tone drop earrings featuring cowrie shell pendants, fan shell accents, and gold spacer beads.",
    price_minor: 129900, // ₹1,299
    compare_at_price_minor: 159900, // ₹1,599
    is_dev_price: true,
    status: "active",
    stock_quantity: 8,
    fulfilment_type: "made_to_order",
    materials: ["Natural scallop bivalves", "White cowrie shells", "Rose glass beads", "Gold-tone fishhooks"],
    dimensions: "Bracelet: 7 inch; Earrings: 2.5 inch drop",
    images: [
      {
        url: "/images/products/scallop-cowrie-earring-bracelet-set.webp",
        alt: "Handcrafted jewellery set with scallop shell and pink crackle bead bracelet paired with matching gold-tone cowrie drop earrings",
        width: 952,
        height: 1280,
        is_primary: true,
      },
    ],
    variants: [
      {
        id: "var-002-set",
        name: "Complete Matching Set",
        sku: "VAP-SET-002-FULL",
        price_minor: 129900,
        in_stock: true,
      },
    ],
    tags: ["gift set", "earrings", "bracelet", "cowrie", "scallop"],
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Lavender Floral Beaded & Pearl Set",
    slug: "lavender-floral-beaded-pearl-set",
    category_slug: "shell-jewellery",
    category_name: "Shell Jewellery",
    description:
      "Delicate handcrafted gift set featuring a purple flower cluster beaded bracelet with gold center accents and clear quartz rondelles, accompanied by elegant drop earrings with faceted purple crystals and baroque white pearls.",
    price_minor: 119900, // ₹1,199
    compare_at_price_minor: 139900, // ₹1,399
    is_dev_price: true,
    status: "active",
    stock_quantity: 10,
    fulfilment_type: "made_to_order",
    materials: ["Seed beads", "Faceted crystals", "Baroque faux pearls", "Gold-plated findings"],
    dimensions: "Bracelet: 6.5–7.5 inch (adjustable with clasp); Earrings: 2.25 inch drop",
    images: [
      {
        url: "/images/products/purple-floral-beaded-pearl-set.webp",
        alt: "Handcrafted purple floral beaded bracelet with gold center beads and matching drop earrings featuring purple crystals and baroque pearls",
        width: 606,
        height: 867,
        is_primary: true,
      },
    ],
    variants: [
      {
        id: "var-003-set",
        name: "Full Set (Bracelet + Earrings)",
        sku: "VAP-SET-003-LAV",
        price_minor: 119900,
        in_stock: true,
      },
    ],
    tags: ["floral", "purple", "pearls", "delicate", "gift set"],
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    name: "Golden Link Cowrie & Conch Charm Bracelet",
    slug: "golden-link-cowrie-conch-charm-bracelet",
    category_slug: "shell-jewellery",
    category_name: "Shell Jewellery",
    description:
      "Golden link chain bracelet adorned with natural seaside treasures: alternating polished ivory cowrie shells and brown-striped spiral conch shells suspended with sturdy jump rings and secure lobster clasp.",
    price_minor: 79900, // ₹799
    compare_at_price_minor: 99900, // ₹999
    is_dev_price: true,
    status: "active",
    stock_quantity: 15,
    fulfilment_type: "made_to_order",
    materials: ["Natural cowrie shells", "Natural spiral shells", "Gold-toned brass chain", "Lobster clasp"],
    dimensions: "7.5 inch length with 1 inch extender chain",
    images: [
      {
        url: "/images/products/golden-link-cowrie-charm-bracelet.webp",
        alt: "Handcrafted gold-tone link charm bracelet with dangling polished white cowrie and brown striped spiral shell charms on beach sand",
        width: 873,
        height: 621,
        is_primary: true,
      },
    ],
    variants: [
      {
        id: "var-004-gold",
        name: "Standard Link with Extender",
        sku: "VAP-BRAC-004-GLD",
        price_minor: 79900,
        in_stock: true,
      },
    ],
    tags: ["charm bracelet", "beach", "cowrie", "gold-tone", "shells"],
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    name: "Custom Relationship Licence Card",
    slug: "relationship-licence-card",
    category_slug: "personalized-cards",
    category_name: "Personalized Cards",
    description:
      "Bespoke couples relationship licence keepsake card featuring your couple picture, partner names, anniversary date, and heartfelt personalized vows printed on 350 GSM archival cardstock with protective sleeve.",
    price_minor: 49900, // ₹499
    compare_at_price_minor: 69900, // ₹699
    is_dev_price: true,
    status: "active",
    stock_quantity: 50,
    fulfilment_type: "made_to_order",
    materials: ["350 GSM Archival Cardstock", "Matte Velvet Lamination", "Protective Acrylic Sleeve"],
    dimensions: "Credit Card Size (85.6mm x 53.98mm) / A6 Keepsake",
    images: [
      {
        url: "/images/templates/relationship-licence-template.webp",
        alt: "Personalized Relationship Licence Card with couple photo and romantic vows",
        width: 800,
        height: 1000,
        is_primary: true,
      },
    ],
    variants: [
      {
        id: "var-005-licence",
        name: "Standard Archival Keepsake",
        sku: "VAP-CARD-001-REL",
        price_minor: 49900,
        in_stock: true,
      },
    ],
    tags: ["relationship licence", "personalized card", "anniversary", "couples", "keepsake"],
  },
  {
    id: "00000000-0000-4000-8000-000000000006",
    name: "Handmade Polaroid Keepsake Photo Card",
    slug: "polaroid-keepsake-card",
    category_slug: "personalized-cards",
    category_name: "Personalized Cards",
    description:
      "High-gloss classic polaroid keepsake card customized with your uploaded picture, handwritten date, and heartfelt dedication message.",
    price_minor: 29900, // ₹299
    compare_at_price_minor: 44900, // ₹449
    is_dev_price: true,
    status: "active",
    stock_quantity: 40,
    fulfilment_type: "made_to_order",
    materials: ["Fuji Premium Gloss Photo Paper", "300 GSM Backing Board", "Hand-stamped wax envelope"],
    dimensions: "Classic Polaroid (3.5 x 4.25 inches)",
    images: [
      {
        url: "/images/templates/relationship-licence-template.webp",
        alt: "Personalized Polaroid Keepsake Photo Card with handwritten caption",
        width: 800,
        height: 1000,
        is_primary: true,
      },
    ],
    variants: [
      {
        id: "var-006-polaroid",
        name: "Single Polaroid Keepsake",
        sku: "VAP-CARD-002-POL",
        price_minor: 29900,
        in_stock: true,
      },
    ],
    tags: ["polaroid", "photo card", "memories", "custom gift"],
  },
];
