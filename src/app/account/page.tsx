import Link from "next/link";
import { UserCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Customer Account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <Section surface="default" className="py-16 md:py-24">
      <Container className="max-w-xl text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-blush/30 flex items-center justify-center text-rose-deep mb-6">
          <UserCheck className="w-6 h-6" aria-hidden="true" />
        </div>

        <Heading level="h1" className="mb-4">
          Seamless Guest Checkout
        </Heading>

        <p className="text-base text-cocoa-muted mb-8 leading-relaxed">
          To ensure effortless gifting without password friction, customer accounts are deferred. All orders use guest checkout with secure tokenized status links sent via email.
        </p>

        <Button asChild variant="primary">
          <Link href="/shop">Browse Collections</Link>
        </Button>
      </Container>
    </Section>
  );
}
