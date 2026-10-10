import { Mail, Phone, MapPin, Send } from "lucide-react";
import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with the VAP Handicrafts team for customer care, orders, or inquiries.",
};

export default function ContactPage() {
  return (
    <Section surface="default" className="py-16 md:py-24">
      <Container className="max-w-4xl">
        <div className="text-center mb-12">
          <Heading level="eyebrow" className="mb-2">
            Get In Touch
          </Heading>
          <Heading level="h1" className="mb-4">
            We&apos;d Love To Hear From You
          </Heading>
          <p className="text-base text-cocoa-muted max-w-lg mx-auto">
            Have a question about a custom keepsake, shipping, or an existing order? Reach out and our team will gladly assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="rounded-md border border-border bg-surface p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-blush/30 text-rose-deep flex items-center justify-center mx-auto mb-3">
              <Mail className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-semibold text-cocoa text-sm mb-1">Email Support</h2>
            <a
              href={`mailto:${BRAND.contact.email}`}
              className="text-sm text-rose-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {BRAND.contact.email}
            </a>
          </div>

          <div className="rounded-md border border-border bg-surface p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-blush/30 text-rose-deep flex items-center justify-center mx-auto mb-3">
              <Phone className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-semibold text-cocoa text-sm mb-1">Phone / WhatsApp</h2>
            <a
              href={`tel:${BRAND.contact.phone.replace(/\s+/g, "")}`}
              className="text-sm text-rose-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {BRAND.contact.phone}
            </a>
          </div>

          <div className="rounded-md border border-border bg-surface p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-blush/30 text-rose-deep flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-semibold text-cocoa text-sm mb-1">Location</h2>
            <p className="text-sm text-cocoa-muted">{BRAND.contact.location}</p>
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
