import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Package } from "lucide-react";
import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <Section surface="default" className="pt-16 pb-20 md:pt-24 md:pb-28">
        <Container className="text-center max-w-4xl mx-auto flex flex-col items-center">
          <Badge variant="default" className="mb-6 px-3.5 py-1 text-xs sm:text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-rose-deep" aria-hidden="true" />
            Soft Luxury Keepsakes & Jewellery
          </Badge>

          <Heading level="display" className="mb-6 max-w-3xl">
            Cherished gifts, handcrafted with timeless warmth.
          </Heading>

          <p className="text-base sm:text-xl text-cocoa-muted max-w-2xl mb-10 leading-relaxed">
            Discover bespoke ocean shell jewellery, personalized keepsake cards, and heartfelt treasures designed to celebrate cherished bonds across India.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" variant="primary">
              <Link href="/shop">
                Explore The Shop <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/about">
                Our Story
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Trust Highlights Section */}
      <Section surface="surface" className="py-12 border-y border-border/70">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-4 rounded-md">
              <div className="p-3 rounded-full bg-blush/30 text-rose-deep shrink-0">
                <HeartHandshake className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-cocoa text-base">Thoughtfully Handcrafted</h3>
                <p className="text-sm text-cocoa-muted mt-1">Each jewellery piece and keepsake gift is prepared with meticulous personal care.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-md">
              <div className="p-3 rounded-full bg-blush/30 text-rose-deep shrink-0">
                <Package className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-cocoa text-base">All-India Delivery</h3>
                <p className="text-sm text-cocoa-muted mt-1">Reliable, carefully-packaged shipping directly to your doorstep across India.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-md">
              <div className="p-3 rounded-full bg-blush/30 text-rose-deep shrink-0">
                <ShieldCheck className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-cocoa text-base">Seamless UPI & Cards</h3>
                <p className="text-sm text-cocoa-muted mt-1">Instant, secure payments via Paytm Payment Gateway and all major UPI apps.</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Featured Collections Preview */}
      <Section surface="default" className="py-16 md:py-24">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Heading level="eyebrow" className="mb-2">Curated With Love</Heading>
              <Heading level="h2">Signature Collections</Heading>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center text-sm font-semibold text-rose-deep hover:text-rose-deeper transition-colors underline-offset-4 hover:underline"
            >
              Browse all items <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group relative rounded-md border border-border bg-surface p-6 shadow-sm transition hover:shadow-md">
              <Heading level="h3" className="mb-2">Shell Jewellery</Heading>
              <p className="text-sm text-cocoa-muted mb-6 leading-relaxed">
                Handcrafted bracelets and earrings showcasing natural shell beads and delicate warm tones.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/shop/jewellery">View Jewellery</Link>
              </Button>
            </div>

            <div className="group relative rounded-md border border-border bg-surface p-6 shadow-sm transition hover:shadow-md">
              <Heading level="h3" className="mb-2">Keepsakes & Cards</Heading>
              <p className="text-sm text-cocoa-muted mb-6 leading-relaxed">
                Personalized message cards, Polaroid keepsake frames, and sentimental gift cards.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/shop/keepsakes">View Keepsakes</Link>
              </Button>
            </div>

            <div className="group relative rounded-md border border-border bg-surface p-6 shadow-sm transition hover:shadow-md">
              <Heading level="h3" className="mb-2">Curated Gift Sets</Heading>
              <p className="text-sm text-cocoa-muted mb-6 leading-relaxed">
                Thoughtful bundle boxes combining matching jewellery sets and personalized notes.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/shop/gift-sets">View Gift Sets</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
