import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy commitments, data collection policies, and customer photo protection.",
};

export default function PrivacyPage() {
  return (
    <Section surface="default" className="py-16 md:py-24">
      <Container className="max-w-3xl">
        <Heading level="h1" className="mb-6">
          Privacy Policy
        </Heading>

        <div className="prose prose-cocoa max-w-none space-y-6 text-cocoa/90 leading-relaxed text-sm sm:text-base">
          <p>
            At {BRAND.name}, we value your trust and are deeply committed to protecting your personal information and uploaded memories.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">1. Data We Collect</h2>
          <p>
            To process your orders and deliver your handcrafted pieces, we collect your name, shipping address, contact phone number, and email. We do not store sensitive payment credentials such as UPI PINs or card numbers—all transactions are securely handled by authorized payment gateways.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">2. Customer Photos & Keepsake Media</h2>
          <p>
            Customer photographs submitted for keepsake cards or frames are stored in private, access-controlled cloud storage. Media is accessed strictly by authorized staff to fulfill your print orders, and is subject to automated retention and deletion schedules.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">3. Contacting Us Regarding Your Data</h2>
          <p>
            For privacy inquiries or deletion requests, please contact our privacy officer at <a href={`mailto:${BRAND.contact.email}`} className="text-rose-deep underline">{BRAND.contact.email}</a>.
          </p>
        </div>
      </Container>
    </Section>
  );
}
