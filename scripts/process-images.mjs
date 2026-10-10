import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIR = path.resolve("assets-source/jewellery");
const OUTPUT_DIR = path.resolve("public/images/products");
const HERO_OUTPUT_DIR = path.resolve("public/images");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PRODUCTS_MAP = [
  {
    sourceFile: "WhatsApp Image 2026-10-10 at 13.42.55.jpeg",
    slug: "shell-cone-pink-crackle-bracelet",
    alt: "Handcrafted circular bracelet with natural striped cone sea shells alternating with pink crackle glass beads on ivory stone pedestal",
  },
  {
    sourceFile: "WhatsApp Image 2026-10-10 at 13.42.55 (1).jpeg",
    slug: "scallop-cowrie-earring-bracelet-set",
    alt: "Handcrafted jewellery set with scallop shell and pink crackle bead bracelet paired with matching gold-tone cowrie drop earrings",
  },
  {
    sourceFile: "WhatsApp Image 2026-10-10 at 13.42.55 (2).jpeg",
    slug: "purple-floral-beaded-pearl-set",
    alt: "Handcrafted purple floral beaded bracelet with gold center beads and matching drop earrings featuring purple crystals and baroque pearls",
  },
  {
    sourceFile: "WhatsApp Image 2026-10-10 at 13.42.56.jpeg",
    slug: "golden-link-cowrie-charm-bracelet",
    alt: "Handcrafted gold-tone link charm bracelet with dangling polished white cowrie and brown striped spiral shell charms on beach sand",
  },
];

async function processImages() {
  console.log("Processing original jewellery photographs into responsive web formats...");

  for (const item of PRODUCTS_MAP) {
    const inputPath = path.join(SOURCE_DIR, item.sourceFile);
    if (!fs.existsSync(inputPath)) {
      console.warn(`Source file not found: ${inputPath}`);
      continue;
    }

    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log(`Processing: ${item.sourceFile} (${metadata.width}x${metadata.height})`);

    // Standard high-res WebP
    const webpPath = path.join(OUTPUT_DIR, `${item.slug}.webp`);
    await sharp(inputPath)
      .webp({ quality: 85, effort: 5 })
      .toFile(webpPath);

    // Standard high-res JPEG
    const jpegPath = path.join(OUTPUT_DIR, `${item.slug}.jpg`);
    await sharp(inputPath)
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(jpegPath);

    // Responsive WebP versions: 640w and 960w
    const widths = [640, 960];
    for (const w of widths) {
      if (metadata.width && metadata.width >= w) {
        await sharp(inputPath)
          .resize({ width: w, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(path.join(OUTPUT_DIR, `${item.slug}-${w}w.webp`));
      }
    }

    console.log(`✓ Processed ${item.slug}`);
  }

  // Create hero fallback poster from the flagship scallop & cowrie photo
  const heroSource = path.join(SOURCE_DIR, "WhatsApp Image 2026-10-10 at 13.42.55 (1).jpeg");
  if (fs.existsSync(heroSource)) {
    console.log("Generating hero static fallback poster...");
    await sharp(heroSource)
      .resize({ width: 1200, height: 1200, fit: "cover", position: "center" })
      .webp({ quality: 85 })
      .toFile(path.join(HERO_OUTPUT_DIR, "hero-fallback.webp"));

    await sharp(heroSource)
      .resize({ width: 1200, height: 1200, fit: "cover", position: "center" })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(path.join(HERO_OUTPUT_DIR, "hero-fallback.jpg"));
    console.log("✓ Hero fallback poster generated at public/images/hero-fallback.webp");
  }

  console.log("Image processing complete!");
}

processImages().catch((err) => {
  console.error("Image processing error:", err);
  process.exit(1);
});
