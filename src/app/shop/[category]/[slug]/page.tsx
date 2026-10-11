import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug } from "@/server/catalogue/queries";
import { ProductDetailsView } from "@/components/catalogue/ProductDetailsView";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | VAP Handicrafts",
    };
  }

  return {
    title: `${product.name} | VAP Handicrafts`,
    description: product.description,
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
