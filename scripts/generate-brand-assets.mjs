import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// ICO file generator helper (PNG embedded icon format)
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  // ICONDIR header is 6 bytes
  const headerSize = 6;
  // Each ICONDIRENTRY is 16 bytes
  const entrySize = 16;
  const dirSize = headerSize + entrySize * count;

  let currentOffset = dirSize;
  const entries = [];
  for (const { buffer, size } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0); // width
    entry.writeUInt8(size === 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // image size in bytes
    entry.writeUInt32LE(currentOffset, 12); // image offset
    entries.push(entry);
    currentOffset += buffer.length;
  }

  const iconDir = Buffer.alloc(6);
  iconDir.writeUInt16LE(0, 0); // reserved
  iconDir.writeUInt16LE(1, 2); // type 1 = icon
  iconDir.writeUInt16LE(count, 4); // number of images

  return Buffer.concat([iconDir, ...entries, ...pngBuffers.map((p) => p.buffer)]);
}

async function run() {
  const sourcePath = path.resolve(
    "C:/Users/Vivan/.gemini/antigravity-ide/brain/ce58d1da-6464-48d4-b36b-bbef74edc44d/.user_uploaded/media_1792032266677.jpg"
  );

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source logo not found at: ${sourcePath}`);
  }

  console.log("Using source logo:", sourcePath);

  // Ensure directories exist
  const dirs = [
    "public",
    "public/images/brand",
    "public/icons",
    "src/app",
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // 1. High-Res Logo Assets
  console.log("Generating brand logo master files...");
  await sharp(sourcePath)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile("public/images/brand/logo.png");

  await sharp(sourcePath)
    .webp({ quality: 95, effort: 6 })
    .toFile("public/images/brand/logo.webp");

  await sharp(sourcePath)
    .resize(128, 128)
    .webp({ quality: 90 })
    .toFile("public/images/brand/logo-128.webp");

  // Also preserve source copy
  fs.copyFileSync(sourcePath, "public/images/brand/logo.jpg");

  // 2. Favicon & App Icons (Google requirement: multiple of 48px, e.g. 48x48, 96x96, 144x144, 192x192, 512x512)
  console.log("Generating favicons and PWA icons...");
  const png16 = await sharp(sourcePath).resize(16, 16).png().toBuffer();
  const png32 = await sharp(sourcePath).resize(32, 32).png().toBuffer();
  const png48 = await sharp(sourcePath).resize(48, 48).png().toBuffer();
  const png180 = await sharp(sourcePath).resize(180, 180).png().toBuffer();
  const png192 = await sharp(sourcePath).resize(192, 192).png().toBuffer();
  const png512 = await sharp(sourcePath).resize(512, 512).png().toBuffer();

  const icoBuffer = createIco([
    { buffer: png16, size: 16 },
    { buffer: png32, size: 32 },
    { buffer: png48, size: 48 },
  ]);

  fs.writeFileSync("public/favicon.ico", icoBuffer);
  fs.writeFileSync("src/app/favicon.ico", icoBuffer);

  // App icons
  fs.writeFileSync("src/app/icon.png", png512); // Next.js outputs size=512x512
  fs.writeFileSync("public/icon.png", png512);
  fs.writeFileSync("src/app/apple-icon.png", png180);
  fs.writeFileSync("public/apple-icon.png", png180);

  // PWA manifest icons
  fs.writeFileSync("public/icons/icon-192x192.png", png192);
  fs.writeFileSync("public/icons/icon-512x512.png", png512);

  // Maskable icons with slight padding so shapes aren't clipped by round launchers
  const maskable192 = await sharp(sourcePath)
    .resize(154, 154)
    .extend({
      top: 19,
      bottom: 19,
      left: 19,
      right: 19,
      background: { r: 251, g: 247, b: 236, alpha: 1 },
    })
    .png()
    .toBuffer();

  const maskable512 = await sharp(sourcePath)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 251, g: 247, b: 236, alpha: 1 },
    })
    .png()
    .toBuffer();

  fs.writeFileSync("public/icons/maskable-192x192.png", maskable192);
  fs.writeFileSync("public/icons/maskable-512x512.png", maskable512);

  // 3. Open Graph Preview Image (1200 x 630)
  // Designed specifically for WhatsApp, iMessage, Twitter/X, Facebook, LinkedIn, Google Discover & Rich Snippets
  console.log("Generating Open Graph preview cards (1200x630)...");
  const width = 1200;
  const height = 630;
  const logoHeight = 580; // Large, prominent logo centered inside safe zone
  const logoWidth = 580;

  const resizedLogo = await sharp(sourcePath)
    .resize(logoWidth, logoHeight, {
      fit: "contain",
      background: { r: 251, g: 247, b: 236, alpha: 1 },
    })
    .toBuffer();

  const svgDecor = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Subtle radial warm glow behind logo -->
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.4" />
          <stop offset="70%" stop-color="#FAF7EC" stop-opacity="0.1" />
          <stop offset="100%" stop-color="#FAF7EC" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="${width}" height="${height}" fill="url(#centerGlow)" />

      <!-- Refined luxury gold double frame -->
      <rect x="22" y="22" width="${width - 44}" height="${height - 44}" rx="12" ry="12" fill="none" stroke="#B69A67" stroke-width="1.5" stroke-opacity="0.4" />
      <rect x="28" y="28" width="${width - 56}" height="${height - 56}" rx="8" ry="8" fill="none" stroke="#7A6232" stroke-width="0.75" stroke-opacity="0.25" />

      <!-- Elegant ornamental corner brackets -->
      <path d="M 18 36 L 18 18 L 36 18" fill="none" stroke="#7A6232" stroke-width="2.5" stroke-linecap="round" />
      <path d="M ${width - 36} 18 L ${width - 18} 18 L ${width - 18} 36" fill="none" stroke="#7A6232" stroke-width="2.5" stroke-linecap="round" />
      <path d="M 18 ${height - 36} L 18 ${height - 18} L 36 ${height - 18}" fill="none" stroke="#7A6232" stroke-width="2.5" stroke-linecap="round" />
      <path d="M ${width - 36} ${height - 18} L ${width - 18} ${height - 18} L ${width - 18} ${height - 36}" fill="none" stroke="#7A6232" stroke-width="2.5" stroke-linecap="round" />

      <!-- Subtle star sparkles on corners -->
      <g transform="translate(42, 42)" fill="#B69A67" opacity="0.6">
        <path d="M 0,-6 Q 0,0 6,0 Q 0,0 0,6 Q 0,0 -6,0 Q 0,0 0,-6 Z" />
      </g>
      <g transform="translate(${width - 42}, 42)" fill="#B69A67" opacity="0.6">
        <path d="M 0,-6 Q 0,0 6,0 Q 0,0 0,6 Q 0,0 -6,0 Q 0,0 0,-6 Z" />
      </g>
      <g transform="translate(42, ${height - 42})" fill="#B69A67" opacity="0.6">
        <path d="M 0,-6 Q 0,0 6,0 Q 0,0 0,6 Q 0,0 -6,0 Q 0,0 0,-6 Z" />
      </g>
      <g transform="translate(${width - 42}, ${height - 42})" fill="#B69A67" opacity="0.6">
        <path d="M 0,-6 Q 0,0 6,0 Q 0,0 0,6 Q 0,0 -6,0 Q 0,0 0,-6 Z" />
      </g>
    </svg>
  `);

  const left = Math.round((width - logoWidth) / 2);
  const top = Math.round((height - logoHeight) / 2);

  const ogPngBuffer = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 251, g: 247, b: 236 },
    },
  })
    .composite([
      { input: resizedLogo, left, top },
      { input: svgDecor, left: 0, top: 0 },
    ])
    .png({ quality: 90, compressionLevel: 8 })
    .toBuffer();

  fs.writeFileSync("public/og-image.png", ogPngBuffer);
  fs.writeFileSync("src/app/opengraph-image.png", ogPngBuffer);

  // Square version (for WhatsApp / Google square card)
  const squareSize = 800;
  const squareLogo = await sharp(sourcePath)
    .resize(squareSize, squareSize, { fit: "contain" })
    .png()
    .toBuffer();
  fs.writeFileSync("public/og-image-square.png", squareLogo);

  console.log("All brand assets successfully generated!");
}

run().catch((err) => {
  console.error("Error generating brand assets:", err);
  process.exit(1);
});
