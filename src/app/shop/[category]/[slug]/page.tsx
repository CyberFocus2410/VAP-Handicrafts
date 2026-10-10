import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { SEED_PRODUCTS } from "@/data/seed-products";

interface ProductPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = SEED_PRODUCTS.find((p) => p.slug === slug);
  if (product) {
    return {
      title: `${product.name} | VAP Handicrafts`,
      description: product.description,
    };
  }
  return {
    title: `Product: ${slug.replace(/-/g, " ")} | VAP Handicrafts`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { category, slug } = await params;
  const product = SEED_PRODUCTS.find((p) => p.slug === slug);
  const humanTitle = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (product) {
    const primaryImage = product.images[0];
    return (
      <Section surface="default" className="py-12 md:py-20">
        <Container>
          <Link
            href={`/shop/${category}`}
            className="inline-flex items-center text-sm font-medium text-cocoa-muted hover:text-rose-deep mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" /> Back to {product.category_name}
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="relative aspect-[4/5] rounded-md border border-border bg-beige/20 overflow-hidden shadow-card">
              {primaryImage && (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              )}
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="default" className="text-xs">
                  {product.category_name}
                </Badge>
                {product.is_dev_price && (
                  <Badge variant="warning" className="text-xs">
                    Dev Sample Price
                  </Badge>
                )}
                {product.fulfilment_type === "made_to_order" && (
                  <Badge variant="outline" className="text-xs">
                    Made to Order
                  </Badge>
                )}
              </div>

              <Heading level="h1">{product.name}</Heading>

              <Price
                paise={product.price_minor}
                compareAtPaise={product.compare_at_price_minor ?? undefined}
                isDevPrice={product.is_dev_price}
                className="text-2xl"
              />

              <p className="text-cocoa-muted text-base leading-relaxed">
                {product.description}
              </p>

              {product.materials.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-cocoa mb-2">Materials & Details</h3>
                  <ul className="space-y-1.5 text-xs text-cocoa-muted">
                    {product.materials.map((m) => (
                      <li key={m} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-deep shrink-0" aria-hidden="true" />
                        <span>{m}</span>
                      </li>
                    ))}
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-rose-deep shrink-0" aria-hidden="true" />
                      <span>{product.dimensions}</span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="pt-4 flex flex-wrap gap-4">
                <Button asChild size="lg" variant="primary">
                  <Link href="/cart">Add to Cart (Sample)</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/shop">Browse More</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section surface="default" className="py-12 md:py-20">
      <Container>
        <Link
          href={`/shop/${category}`}
          className="inline-flex items-center text-sm font-medium text-cocoa-muted hover:text-rose-deep mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" /> Back to {category}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="aspect-[4/5] rounded-md border border-border bg-beige/20 flex items-center justify-center p-8 text-center text-cocoa-muted">
            <span>Product Gallery & 3D Interactive Viewer</span>
          </div>

          <div className="space-y-6">
            <Badge variant="default" className="text-xs">
              Catalogue Preview
            </Badge>
            <Heading level="h1">{humanTitle}</Heading>
            <p className="text-cocoa-muted text-base leading-relaxed">
              Full product specifications, variant selections, image gallery, and personalization fields will be integrated during Phase 3.
            </p>
            <div className="pt-4">
              <Button asChild variant="secondary">
                <Link href="/shop">Browse All Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
