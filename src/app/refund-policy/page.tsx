import { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "Returns, Replacements & Refund Policy | VAP Handicrafts",
  description:
    "Review VAP Handicrafts return guidelines, 48-hour damaged transit replacement policy, bespoke personalization criteria, and prompt UPI/Paytm refund timelines.",
  alternates: {
    canonical: "/refund-policy",
  },
  openGraph: {
    title: "Returns, Replacements & Refund Policy | VAP Handicrafts",
    description:
      "VAP Handicrafts return, replacement, and refund policies for shell jewellery and bespoke keepsake gifts.",
    url: "/refund-policy",
  },
};

export default function RefundPolicyPage() {
  return (
    <Section surface="default" className="py-12 md:py-20">
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ label: "Returns & Refund Policy", href: "/refund-policy" }]} className="mb-8" />

        <Heading level="h1" className="mb-6">
          Returns & Refund Policy
        </Heading>

        <div className="prose prose-cocoa max-w-none space-y-6 text-cocoa/90 leading-relaxed text-sm sm:text-base">
          <p>
            At {BRAND.name}, customer satisfaction is our top priority. Due to the bespoke nature of our catalogue, please review our refund and return guidelines below.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">1. Personalized Cards &amp; Custom Gifts</h2>
          <p>
            Because custom photo cards, relationship licences, and personalized message cards are crafted uniquely to your personal photos and specifications, they are generally non-returnable unless received damaged or with a printing defect.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">2. Damaged or Defective Items</h2>
          <p>
            In the rare event that your piece arrives damaged or defective, please contact our support team at <a href={`mailto:${BRAND.contact.email}`} className="text-rose-deep underline font-medium">{BRAND.contact.email}</a> within 48 hours of delivery with clear photographs and your Order Reference ID. We will promptly issue a replacement or full refund.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">3. Refund Processing</h2>
          <p>
            Verified refunds are reversed back to your original payment method (via Paytm Payment Gateway or original UPI source account) within 5 to 7 business days following inspection.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 text-xs text-cocoa-muted">
          <span>Related Policies & Links:</span>
          <Link href="/shipping-policy" className="text-rose-deep font-medium hover:underline">
            Shipping & Delivery Policy
          </Link>
          <span>•</span>
          <Link href="/contact" className="text-rose-deep font-medium hover:underline">
            Contact Support & Claims
          </Link>
          <span>•</span>
          <Link href="/shop" className="text-rose-deep font-medium hover:underline">
            Explore Handcrafted Jewellery
          </Link>
        </div>
      </Container>
    </Section>
  );
}
