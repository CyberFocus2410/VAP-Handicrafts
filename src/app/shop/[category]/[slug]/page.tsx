import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  return {
    title: `Product: ${slug.replace(/-/g, " ")}`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { category, slug } = await params;
  const humanTitle = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

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
            <span>Product Gallery & 3D Interactive Viewer (Scheduled for Phase 2 / Phase 3)</span>
          </div>

          <div className="space-y-6">
            <Badge variant="default" className="text-xs">
              Phase 3 Preview
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
