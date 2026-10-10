import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vaphandicrafts.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/*",
        "/order-status",
        "/order-status/*",
        "/payment",
        "/payment/*",
        "/account",
        "/account/*",
        "/api/*",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
