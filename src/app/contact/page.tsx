import Image from "next/image";
import { Mail, Phone, MapPin, Send, Instagram } from "lucide-react";
import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact/ContactForm";

import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { generateAutoAlt } from "@/lib/images/auto-alt";

export const metadata: Metadata = {
  title: "Contact Founders | Custom Orders & Support | VAP Handicrafts",
  description:
    "Get in touch directly with Pulkit Garg and Vivan Mittal at VAP Handicrafts for custom shell jewellery, relationship cards, personalized gifts, or bulk party orders.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Founders | Custom Orders & Support | VAP Handicrafts",
    description:
      "Get in touch directly with Pulkit Garg and Vivan Mittal at VAP Handicrafts for custom shell jewellery, relationship cards, and personalized gifting.",
    url: "/contact",
    images: [{ url: BRAND.logo.src, width: 800, height: 800, alt: "VAP Handicrafts Contact & Support" }],
  },
};

export default function ContactPage() {
  return (
    <Section surface="default" className="py-12 md:py-20">
      <Container className="max-w-4xl">
        <Breadcrumbs items={[{ label: "Contact Us", href: "/contact" }]} className="mb-8" />

        <div className="text-center mb-12">
          <div className="relative h-20 w-20 rounded-full overflow-hidden shadow-md border-2 border-gold-deep/30 bg-ivory mx-auto mb-4">
            <Image
              src={BRAND.logo.src}
              alt={generateAutoAlt({ context: "hero", name: `${BRAND.name} official logo` })}
              width={80}
              height={80}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <Heading level="eyebrow" className="mb-2">
            {BRAND.tagline}
          </Heading>
          <Heading level="h1" className="mb-4">
            Connect With Us
          </Heading>
          <p className="text-base text-cocoa-muted max-w-lg mx-auto">
            {BRAND.motto} — Have a question about personalized cards, shell jewellery, or custom gifting? Reach out directly to our founders.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Email Support */}
          <div className="rounded-md border border-border bg-surface p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-blush/30 text-rose-deep flex items-center justify-center mx-auto mb-3">
              <Mail className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-semibold text-cocoa text-sm mb-1">Email Support</h2>
            <a
              href={`mailto:${BRAND.contact.email}`}
              className="text-xs sm:text-sm text-rose-deep font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm break-all"
            >
              {BRAND.contact.email}
            </a>
          </div>

          {/* Instagram */}
          <div className="rounded-md border border-border bg-surface p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-blush/30 text-rose-deep flex items-center justify-center mx-auto mb-3">
              <Instagram className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-semibold text-cocoa text-sm mb-1">Instagram</h2>
            <a
              href={BRAND.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-rose-deep font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {BRAND.contact.instagram}
            </a>
          </div>

          {/* Pulkit Garg */}
          <div className="rounded-md border border-border bg-surface p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-blush/30 text-rose-deep flex items-center justify-center mx-auto mb-3">
              <Phone className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-semibold text-cocoa text-sm mb-1">Pulkit Garg</h2>
            <a
              href="tel:+919311516813"
              className="text-sm text-rose-deep font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              +91 9311516813
            </a>
          </div>

          {/* Vivan Mittal */}
          <div className="rounded-md border border-border bg-surface p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-blush/30 text-rose-deep flex items-center justify-center mx-auto mb-3">
              <Phone className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-semibold text-cocoa text-sm mb-1">Vivan Mittal</h2>
            <a
              href="tel:+919310039258"
              className="text-sm text-rose-deep font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              +91 9310039258
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm max-w-xl mx-auto">
          <Heading level="h2" className="text-2xl mb-2 text-center">
            Send Us A Message
          </Heading>
          <p className="text-xs text-cocoa-muted text-center mb-6">
            Share your gift requirements, bulk order questions, or custom keepsake ideas.
          </p>

          <ContactForm />
        </div>

        {/* Helpful Internal Links */}
        <div className="mt-12 text-center text-xs text-cocoa-muted space-x-4">
          <span>Looking for immediate answers?</span>
          <Link href="/shipping-policy" className="text-rose-deep font-medium hover:underline">
            Shipping & Timelines
          </Link>
          <span>•</span>
          <Link href="/refund-policy" className="text-rose-deep font-medium hover:underline">
            Cancellation & Returns
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
