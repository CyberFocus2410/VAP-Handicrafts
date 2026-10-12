import { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy & Customer Media Protection | VAP Handicrafts",
  description:
    "Learn how VAP Handicrafts protects your privacy, personal information, and uploaded keepsake photos with access-controlled private cloud storage and secure UPI/Paytm processing.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy & Customer Media Protection | VAP Handicrafts",
    description:
      "VAP Handicrafts data privacy commitments, photo security policies, and personal information handling.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <Section surface="default" className="py-12 md:py-20">
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ label: "Privacy Policy", href: "/privacy" }]} className="mb-8" />

        <Heading level="h1" className="mb-6">
          Privacy Policy &amp; Cookie Guidelines
        </Heading>

        <div className="prose prose-cocoa max-w-none space-y-6 text-cocoa/90 leading-relaxed text-sm sm:text-base">
          <p>
            Welcome to {BRAND.name} (operated by {BRAND.legalName}). We value your trust and are deeply committed to protecting your personal information and personal keepsake memories in strict compliance with India&apos;s Digital Personal Data Protection Act (DPDP Act 2023) and global security best practices.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">1. Personal Data We Collect</h2>
          <p>
            When you browse, customize, or place an order on our store, we collect:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-cocoa-muted">
            <li><strong>Order Fulfillment Details:</strong> Full name, domestic shipping address, PIN code, contact phone number, and email.</li>
            <li><strong>Personalization Assets:</strong> Uploaded photographs, custom names, anniversary dates, and messages for bespoke keepsake cards and relationship frames.</li>
            <li><strong>Technical Identifiers:</strong> IP addresses and browser headers monitored securely through Cloudflare for spam mitigation and fraud prevention.</li>
          </ul>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">2. Cookies &amp; Local Storage Policy</h2>
          <p>
            We deploy minimal, transparent storage mechanisms to ensure your browsing experience is swift and dependable:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-cocoa-muted">
            <li><strong>Essential Storage:</strong> Used to maintain items in your shopping bag (<code className="text-xs bg-surface px-1 py-0.5 rounded text-cocoa">vap_cart_v1</code>) and ensure checkout integrity across sessions.</li>
            <li><strong>Preference Cookies:</strong> Remembers your privacy and consent selections (<code className="text-xs bg-surface px-1 py-0.5 rounded text-cocoa">vap_cookie_consent_v1</code>) so our banner does not reappear repeatedly.</li>
            <li><strong>Spam &amp; Bot Defense:</strong> Cloudflare security cookies (<code className="text-xs bg-surface px-1 py-0.5 rounded text-cocoa">__cf_bm</code>, Turnstile) used exclusively to distinguish genuine customers from automated scraping bots.</li>
          </ul>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">3. Customer Photos &amp; Keepsake Media Protection</h2>
          <p>
            Photographs uploaded for custom Polaroid keepsakes and relationship cards are stored in private, access-controlled cloud storage. Images are never made publicly searchable, are accessed strictly by our founding team for print production, and are scheduled for automatic purge following order fulfillment.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">4. Payment Information Security</h2>
          <p>
            We do not store UPI PINs, credit card numbers, or banking passwords. All online payments are processed through RBI-authorized payment gateways (Paytm PG) and verified directly through merchant UPI QR infrastructure with end-to-end 256-bit SSL encryption.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">5. Your Data Rights</h2>
          <p>
            You retain full ownership of your personal data. At any time, you may request a copy of your stored records, request immediate deletion of uploaded photographs, or update your contact information by writing to our team at <a href={`mailto:${BRAND.contact.email}`} className="text-rose-deep underline font-medium">{BRAND.contact.email}</a> or messaging us directly on WhatsApp (+91 9311516813 / +91 9310039258).
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 text-xs text-cocoa-muted">
          <span>Related Links:</span>
          <Link href="/terms" className="text-rose-deep font-medium hover:underline">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/contact" className="text-rose-deep font-medium hover:underline">
            Contact Privacy Officer
          </Link>
          <span>•</span>
          <Link href="/shop" className="text-rose-deep font-medium hover:underline">
            Back to Store
          </Link>
        </div>
      </Container>
    </Section>
  );
}
