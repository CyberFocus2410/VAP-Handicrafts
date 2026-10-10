import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Processing Payment Verification",
  robots: { index: false, follow: false },
};

export default function PaymentReturnPage() {
  return (
    <Section surface="surface" className="py-16 md:py-24">
      <Container className="max-w-xl text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-blush/30 flex items-center justify-center text-rose-deep mb-6">
          <Loader2 className="w-6 h-6 animate-spin text-rose-deep" aria-hidden="true" />
        </div>

        <Heading level="h1" className="mb-4">
          Verifying Payment With Gateway
        </Heading>

        <p className="text-base text-cocoa-muted mb-8 leading-relaxed">
          Please wait while our backend reconciles the payment confirmation with the gateway. Never rely on browser redirects alone for order fulfillment.
        </p>

        <Button asChild variant="outline">
          <Link href="/">Return to Storefront</Link>
        </Button>
      </Container>
    </Section>
  );
}
