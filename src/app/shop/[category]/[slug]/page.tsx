import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug } from "@/server/catalogue/queries";
import { ProductDetailsView } from "@/components/catalogue/ProductDetailsView";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | VAP Handicrafts",
    };
  }

  const priceFormatted = `₹${(product.priceMinor / 100).toFixed(0)}`;
  const seoDescription = `${product.name} (${priceFormatted}) — Handcrafted with authentic ocean seashells and crackle beads. ${product.description.slice(0, 140)}... Order online across India.`;

  return {
    title: `${product.name} | VAP Handicrafts`,
    description: seoDescription,
    alternates: {
      canonical: `/shop/${category}/${slug}`,
    },
    openGraph: {
      title: `${product.name} | VAP Handicrafts`,
      description: seoDescription,
      url: `/shop/${category}/${slug}`,
      siteName: "VAP Handicrafts",
      images: product.images[0]
        ? [{ url: product.images[0].url, width: 800, height: 1000, alt: product.images[0].alt || product.name }]
        : [{ url: "/og-image.png", width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | VAP Handicrafts`,
      description: seoDescription,
      images: product.images[0] ? [product.images[0].url] : ["/og-image.png"],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailsView product={product} />;
}
