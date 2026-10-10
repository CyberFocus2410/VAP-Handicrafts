import Link from "next/link";
import { Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Payment Pending Verification",
  robots: { index: false, follow: false },
};

export default function PaymentPendingPage() {
  return (
    <Section surface="surface" className="py-16 md:py-24">
      <Container className="max-w-xl text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-gold-deep/15 flex items-center justify-center text-gold-deep mb-6">
          <Clock className="w-6 h-6" aria-hidden="true" />
        </div>

        <Heading level="h1" className="mb-4">
          Payment Status Pending
        </Heading>

        <p className="text-base text-cocoa-muted mb-8 leading-relaxed">
          Your payment is awaiting confirmation from your UPI bank or provider. Per RULES.md Rule B7, uncertain transactions display &ldquo;verifying&rdquo; and are automatically rechecked via server status API.
        </p>

        <Button asChild variant="outline">
          <Link href="/">Back to Storefront</Link>
        </Button>
      </Container>
    </Section>
  );
}
