import type { MetadataRoute } from "next";
import { listProducts, listCategories } from "@/server/catalogue/queries";
import { SEED_PRODUCTS } from "@/data/seed-products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
      : "https://vap-handicrafts.vercel.app";

  const now = new Date();

  // 1. Static Core Storefront Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/personalize/polaroid-keepsake-cards`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // 2. Dynamic Category & Collection Routes
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await listCategories();
    for (const cat of categories) {
      categoryRoutes.push({
        url: `${baseUrl}/shop/${cat.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.85,
      });
      categoryRoutes.push({
        url: `${baseUrl}/collections/${cat.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.85,
      });
    }
  } catch {
    categoryRoutes = [
      {
        url: `${baseUrl}/shop/jewellery`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.85,
      },
      {
        url: `${baseUrl}/shop/shell-jewellery`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.85,
      },
      {
        url: `${baseUrl}/shop/personalized-cards`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.85,
      },
      {
        url: `${baseUrl}/collections/shell-jewellery`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.85,
      },
      {
        url: `${baseUrl}/collections/personalized-cards`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.85,
      },
    ];
  }

  // 3. Dynamic Products with Image Search Metadata
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const { products } = await listProducts({ limit: 100 });
    const productList = products && products.length > 0 ? products : SEED_PRODUCTS;
    for (const prod of productList) {
      const imageUrls = (prod.images || [])
        .map((img: { url: string }) => (img.url.startsWith("http") ? img.url : `${baseUrl}${img.url}`))
        .filter(Boolean);

      // Primary canonical product page
      productRoutes.push({
        url: `${baseUrl}/products/${prod.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.85,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });

      // Category-scoped product page
      const catSlug = (prod as any).categorySlug || (prod as any).category_slug;
      if (catSlug) {
        productRoutes.push({
          url: `${baseUrl}/shop/${catSlug}/${prod.slug}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
          images: imageUrls.length > 0 ? imageUrls : undefined,
        });
      }
    }
  } catch {
    for (const prod of SEED_PRODUCTS) {
      const imageUrls = (prod.images || [])
        .map((img) => (img.url.startsWith("http") ? img.url : `${baseUrl}${img.url}`))
        .filter(Boolean);

      productRoutes.push({
        url: `${baseUrl}/products/${prod.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.85,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });

      if (prod.category_slug) {
        productRoutes.push({
          url: `${baseUrl}/shop/${prod.category_slug}/${prod.slug}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
          images: imageUrls.length > 0 ? imageUrls : undefined,
        });
      }
    }
  }

  // Deduplicate URLs
  const seen = new Set<string>();
  const combined = [...staticRoutes, ...categoryRoutes, ...productRoutes];
  const uniqueRoutes: MetadataRoute.Sitemap = [];

  for (const item of combined) {
    if (!seen.has(item.url)) {
      seen.add(item.url);
      uniqueRoutes.push(item);
    }
  }

  return uniqueRoutes;
}
