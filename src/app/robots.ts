import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
      : "https://vaphandicrafts.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/checkout",
          "/checkout/*",
          "/cart",
          "/order/*",
          "/order-status",
          "/order-status/*",
          "/payment",
          "/payment/*",
          "/account",
          "/account/*",
          "/thank-you",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/checkout",
          "/checkout/*",
          "/cart",
          "/order/*",
          "/order-status/*",
          "/payment/*",
          "/account/*",
          "/thank-you",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/images/*", "/_next/image*", "/og-image.png"],
        disallow: ["/admin/*", "/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
