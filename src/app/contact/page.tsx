import Image from "next/image";
import { Mail, Phone, MapPin, Send, Instagram } from "lucide-react";
import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Pulkit Garg and Vivan Mittal at VAP Handicrafts for personalized gifts and custom orders.",
};

export default function ContactPage() {
  return (
    <Section surface="default" className="py-16 md:py-24">
      <Container className="max-w-4xl">
        <div className="text-center mb-12">
          <div className="relative h-20 w-20 rounded-full overflow-hidden shadow-md border-2 border-gold-deep/30 bg-ivory mx-auto mb-4">
            <Image
              src={BRAND.logo.src}
              alt={BRAND.name}
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
        <div className="rounded-lg border border-border bg-surface p-8 shadow-sm max-w-xl mx-auto">
          <Heading level="h2" className="text-2xl mb-6 text-center">
            Send Us A Message
          </Heading>

          <form
            className="space-y-5"
            onSubmit={undefined}
            aria-label="Contact inquiry form"
          >
            <FormField
              id="contact-name"
              label="Your Full Name"
              required
            >
              {({ id, error, "aria-describedby": ariaDescribedBy, "aria-required": ariaRequired }) => (
                <Input
                  id={id}
                  name="name"
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  required={ariaRequired}
                  error={error}
                  aria-describedby={ariaDescribedBy}
                />
              )}
            </FormField>

            <FormField
              id="contact-email"
              label="Email Address"
              required
            >
              {({ id, error, "aria-describedby": ariaDescribedBy, "aria-required": ariaRequired }) => (
                <Input
                  id={id}
                  name="email"
                  type="email"
                  placeholder="priya@example.com"
                  required={ariaRequired}
                  error={error}
                  aria-describedby={ariaDescribedBy}
                />
              )}
            </FormField>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-message" className="text-sm font-medium text-cocoa">
                Message <span className="text-error" aria-hidden="true">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                required
                placeholder="How can we help you today?"
                className="flex w-full rounded-sm border border-border bg-surface px-3 py-2 text-base text-cocoa transition-colors placeholder:text-cocoa-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </div>

            <Button type="button" variant="primary" size="md" className="w-full">
              <Send className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Send Message
            </Button>
          </form>
        </div>
      </Container>
    </Section>
  );
}
