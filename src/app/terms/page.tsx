import { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service | VAP Handicrafts Store Policies",
  description:
    "Review VAP Handicrafts terms and conditions governing purchases, accurate pricing in INR, custom photo uploads, and customer rights under Indian law.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service | VAP Handicrafts Store Policies",
    description:
      "VAP Handicrafts terms of service and conditions of sale for shell jewellery and personalized keepsakes.",
    url: "/terms",
  },
};

export default function TermsPage() {
  return (
    <Section surface="default" className="py-12 md:py-20">
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ label: "Terms of Service", href: "/terms" }]} className="mb-8" />

        <Heading level="h1" className="mb-6">
          Terms of Service
        </Heading>

        <div className="prose prose-cocoa max-w-none space-y-6 text-cocoa/90 leading-relaxed text-sm sm:text-base">
          <p>
            Welcome to {BRAND.name} (operated by {BRAND.legalName}). By placing an order or browsing our storefront, you agree to comply with and be bound by the following terms of service.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">1. Purchases & Accurate Pricing</h2>
          <p>
            All prices are quoted in Indian Rupees (INR) and are inclusive of applicable taxes. In the event of technical error, {BRAND.name} reserves the right to cancel orders placed at manifestly incorrect prices.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">2. Custom Content & Uploads</h2>
          <p>
            When uploading photos for personalized cards and custom gifts, you represent that you hold necessary rights to such media and that uploads do not violate privacy or third-party copyrights.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">3. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of India.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 text-xs text-cocoa-muted">
          <span>Related Policies:</span>
          <Link href="/privacy" className="text-rose-deep font-medium hover:underline">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/refund-policy" className="text-rose-deep font-medium hover:underline">
            Refunds & Cancellations
          </Link>
          <span>•</span>
          <Link href="/shop" className="text-rose-deep font-medium hover:underline">
            Browse Store
          </Link>
        </div>
      </Container>
    </Section>
  );
}
