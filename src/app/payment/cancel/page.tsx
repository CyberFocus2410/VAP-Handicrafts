import Link from "next/link";
import { XCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Payment Cancelled",
  robots: { index: false, follow: false },
};

export default function PaymentCancelPage() {
  return (
    <Section surface="surface" className="py-16 md:py-24">
      <Container className="max-w-xl text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-error/15 flex items-center justify-center text-error mb-6">
          <XCircle className="w-6 h-6" aria-hidden="true" />
        </div>

        <Heading level="h1" className="mb-4">
          Payment Was Not Completed
        </Heading>

        <p className="text-base text-cocoa-muted mb-8 leading-relaxed">
          The payment flow was cancelled or abandoned. You have not been charged.
        </p>

        <div className="flex justify-center gap-4">
          <Button asChild variant="primary">
            <Link href="/cart">Return to Cart</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
