/**
 * Intelligent Automatic Alt Text Generator
 * Ensures every image in VAP Handicrafts has an accessible, SEO-optimized alt description.
 * Automatically computes contextual descriptions for all present and future images.
 */

export interface AutoAltOptions {
  title?: string;
  name?: string;
  category?: string;
  materials?: string | string[];
  type?: "product" | "polaroid" | "hero" | "collection" | "logo" | "proof" | "general";
  context?: "product" | "polaroid" | "hero" | "collection" | "logo" | "proof" | "general";
  index?: number;
  total?: number;
  customText?: string;
}

export function generateAutoAlt(options: AutoAltOptions = {}): string {
  const { title, name, category, index, total, customText } = options;
  const type = options.context || options.type || "product";

  // If a descriptive custom text is already provided, use it
  if (customText && customText.trim().length > 3 && !customText.toLowerCase().includes("untitled")) {
    return customText.trim();
  }

  const subjectName = (name || title || "").trim();
  const categoryLabel = (category || "").trim();
  const viewSuffix = index !== undefined ? ` - View ${index + 1}${total ? ` of ${total}` : ""}` : "";

  switch (type) {
    case "logo":
      return "VAP Handicrafts Official Brand Logo — Handcrafted Shell Jewellery & Custom Keepsakes";

    case "hero":
      return "Handcrafted Conch Shell Jewellery & Seaside Keepsakes Collection Showcase — VAP Handicrafts";

    case "polaroid":
      return subjectName
        ? `${subjectName} — Handcrafted Polaroid Memory Keepsake Frame with Natural Shells | VAP Handicrafts`
        : "Customizable Polaroid Memory Keepsake Frame with Natural Shell Accents | VAP Handicrafts";

    case "collection":
      return subjectName
        ? `${subjectName} Collection — Artisanal Handmade Shell Jewellery & Keepsakes | VAP Handicrafts`
        : "Artisanal Handmade Jewellery & Gifts Collection | VAP Handicrafts";

    case "proof":
      return `Customer UPI Payment Screenshot Verification Proof${subjectName ? ` for ${subjectName}` : ""}`;

    case "product":
    default:
      if (subjectName) {
        const catPart = categoryLabel ? ` (${categoryLabel})` : "";
        return `${subjectName}${catPart} — Authentic Handcrafted Shell Jewellery & Gifts${viewSuffix} | VAP Handicrafts`;
      }
      return `Artisanal Handcrafted Shell Jewellery Keepsake${viewSuffix} | VAP Handicrafts`;
  }
}
