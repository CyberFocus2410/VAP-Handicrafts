import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vaphandicrafts.com";
  const currentDate = new Date();

  const routes = [
    "",
    "/shop",
    "/shop/jewellery",
    "/shop/personalized-cards",
    "/about",
    "/contact",
    "/shipping-policy",
    "/refund-policy",
    "/privacy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "" || route === "/shop" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/shop") ? 0.8 : 0.5,
  }));
}
