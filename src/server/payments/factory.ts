import { PaymentProvider } from "./types";
import { PaytmPaymentProvider } from "./paytm";
import { SimulatorPaymentProvider } from "./simulator";

export function getPaymentProvider(): PaymentProvider {
  const mid = process.env.PAYTM_MID;
  const merchantKey = process.env.PAYTM_MERCHANT_KEY;
  const website = process.env.PAYTM_WEBSITE || "WEBSTAGING";
  const env = (process.env.PAYTM_ENVIRONMENT as "staging" | "production") || "staging";

  // Use simulator if live Paytm keys are missing or simulator explicitly requested in dev
  if (!mid || !merchantKey || process.env.NEXT_PUBLIC_ENABLE_PAYMENT_SIMULATOR === "true") {
    return new SimulatorPaymentProvider();
  }

  return new PaytmPaymentProvider({
    mid,
    merchantKey,
    website,
    environment: env,
  });
}
