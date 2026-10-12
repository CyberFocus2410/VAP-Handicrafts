import { Metadata } from "next";
import { CheckoutPageView } from "@/components/checkout/CheckoutPageView";

export const metadata: Metadata = {
  title: "Secure Checkout | VAP Handicrafts",
  description:
    "Complete your handcrafted shell jewellery & personalized cards order with secure UPI, Net Banking, and Paytm payments.",
  alternates: {
    canonical: "/checkout",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutPageView />;
}
