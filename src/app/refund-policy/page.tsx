import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";

export const metadata = {
  title: "Returns & Refund Policy",
  description: "Policies regarding returns, replacements, and refunds for handcrafted and personalized items.",
};

export default function RefundPolicyPage() {
  return (
    <Section surface="default" className="py-16 md:py-24">
      <Container className="max-w-3xl">
        <Heading level="h1" className="mb-6">
          Returns & Refund Policy
        </Heading>

        <div className="prose prose-cocoa max-w-none space-y-6 text-cocoa/90 leading-relaxed text-sm sm:text-base">
          <p>
            At {BRAND.name}, customer satisfaction is our top priority. Due to the bespoke nature of our catalogue, please review our refund and return guidelines below.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">1. Personalized Keepsakes</h2>
          <p>
            Because custom photo frames, Polaroid memories, and personalized message cards are crafted uniquely to your personal photos and specifications, they are generally non-returnable unless received damaged or with a manufacturing defect.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">2. Damaged or Defective Items</h2>
          <p>
            In the rare event that your piece arrives damaged or defective, please contact our support team at <a href={`mailto:${BRAND.contact.email}`} className="text-rose-deep underline">{BRAND.contact.email}</a> within 48 hours of delivery with clear photographs and your Order ID. We will promptly issue a replacement or full refund.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">3. Refund Processing</h2>
          <p>
            Verified refunds are reversed back to your original payment method (via Paytm Payment Gateway or original UPI source account) within 5 to 7 business days following inspection.
          </p>
        </div>
      </Container>
    </Section>
  );
}
