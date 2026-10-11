import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing purchases and usage of VAP Handicrafts services.",
};

export default function TermsPage() {
  return (
    <Section surface="default" className="py-16 md:py-24">
      <Container className="max-w-3xl">
        <Heading level="h1" className="mb-6">
          Terms of Service
        </Heading>

        <div className="prose prose-cocoa max-w-none space-y-6 text-cocoa/90 leading-relaxed text-sm sm:text-base">
          <p>
            Welcome to {BRAND.name} (operated by {BRAND.legalName}). By placing an order or browsing our storefront, you agree to comply with and be bound by the following terms of service.
          </p>

          <h2 className="text-xl font-semibold text-cocoa mt-6 mb-2">1. Purchases & Accurate Pricing</h2>
          <p>
            All prices are quoted in Indian Rupees (INR) and are inclusive or exclusive of taxes as specified at checkout. In the event of technical error, {BRAND.name} reserves the right to cancel orders placed at incorrect prices.
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
      </Container>
    </Section>
  );
}
