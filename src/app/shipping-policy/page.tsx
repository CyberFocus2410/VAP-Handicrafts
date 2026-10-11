import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";

export const metadata = {
  title: "Shipping Policy",
  description: "Shipping rates, processing times, and delivery policies across India.",
};

export default function ShippingPolicyPage() {
  return (
    <Section surface="default" className="py-16 md:py-24">
      <Container className="max-w-3xl">
        <Heading level="h1" className="mb-6">
          Shipping Policy
        </Heading>

        <div className="prose prose-cocoa max-w-none space-y-6 text-cocoa/90 leading-relaxed text-sm sm:text-base">
          <p>
            Thank you for shopping with {BRAND.name}. Below are our preliminary shipping terms and dispatch guidelines for deliveries across India.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">1. Processing & Crafting Times</h2>
          <p>
            Because each personalized gift and handcrafted jewellery item is prepared with care:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-cocoa-muted">
            <li>Standard shell jewellery pieces ship within 2 to 4 business days.</li>
            <li>Customized photo cards and message cards require 3 to 5 business days for production and quality inspection prior to dispatch.</li>
          </ul>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">2. Domestic Delivery Across India</h2>
          <p>
            Orders are dispatched via trusted domestic courier partners (Blue Dart, DTDC, India Post Speed Post, Delhivery). Typical transit times range from 3 to 7 business days depending on delivery location (Metro cities: 3-5 days; Non-metro locations: 5-7 days).
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">3. Shipping Rates & Tracking</h2>
          <p>
            Standard shipping rates are calculated dynamically at checkout based on order subtotal (FREE shipping on orders of ₹999 and above). Once your package is dispatched, tracking details are sent via email.
          </p>
        </div>
      </Container>
    </Section>
  );
}
