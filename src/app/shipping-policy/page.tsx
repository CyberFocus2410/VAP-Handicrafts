import { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "Shipping Policy & Pan-India Delivery Timelines | VAP Handicrafts",
  description:
    "Learn about VAP Handicrafts domestic shipping policy, processing times (2-4 days), trusted courier partners (Blue Dart, DTDC, India Post), and free delivery over ₹999 across India.",
  alternates: {
    canonical: "/shipping-policy",
  },
  openGraph: {
    title: "Shipping Policy & Pan-India Delivery Timelines | VAP Handicrafts",
    description:
      "VAP Handicrafts delivery policies, dispatch estimates, tracking information, and pan-India shipping coverage.",
    url: "/shipping-policy",
  },
};

export default function ShippingPolicyPage() {
  return (
    <Section surface="default" className="py-12 md:py-20">
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ label: "Shipping Policy", href: "/shipping-policy" }]} className="mb-8" />

        <Heading level="h1" className="mb-6">
          Shipping Policy & Pan-India Delivery
        </Heading>

        <div className="prose prose-cocoa max-w-none space-y-6 text-cocoa/90 leading-relaxed text-sm sm:text-base">
          <p>
            Thank you for shopping with {BRAND.name}. Below are our shipping terms and dispatch guidelines for deliveries across India.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">1. Processing & Crafting Times</h2>
          <p>
            Because each personalized gift and handcrafted jewellery item is prepared with care:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-cocoa-muted">
            <li>Standard shell jewellery pieces ship within 2 to 4 business days.</li>
            <li>Customized photo cards and relationship keepsakes require 3 to 5 business days for precision printing and quality inspection prior to dispatch.</li>
          </ul>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">2. Domestic Delivery Across India</h2>
          <p>
            Orders are dispatched via trusted domestic courier partners (Blue Dart, DTDC, India Post Speed Post, Delhivery). Typical transit times range from 3 to 7 business days depending on delivery location (Metro cities: 3-5 days; Non-metro locations: 5-7 days).
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">3. Shipping Rates & Tracking</h2>
          <p>
            Standard shipping rates are calculated dynamically at checkout based on order subtotal (FREE shipping on orders of ₹999 and above). Once your package is dispatched, tracking details are sent via email and SMS notification.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 text-xs text-cocoa-muted">
          <span>Related Information:</span>
          <Link href="/refund-policy" className="text-rose-deep font-medium hover:underline">
            Cancellation & Refund Policy
          </Link>
          <span>•</span>
          <Link href="/contact" className="text-rose-deep font-medium hover:underline">
            Contact Founders for Urgent Delivery
          </Link>
          <span>•</span>
          <Link href="/shop" className="text-rose-deep font-medium hover:underline">
            Return to Shop
          </Link>
        </div>
      </Container>
    </Section>
  );
}
