import { describe, it, expect } from "vitest";
import { SimulatorPaymentProvider } from "@/server/payments/simulator";
import { PaytmPaymentProvider } from "@/server/payments/paytm";
import { markOrderPaid, createOrder } from "@/server/orders/service";

describe("Payment Providers & Amount Integrity (PRD §18, §24 Phase 5)", () => {
  const dummyAddress = {
    fullName: "Vivan Mittal",
    email: "vivan@example.com",
    phone: "9310039258",
    streetAddress: "123 Ocean Lane, Model Town",
    city: "Delhi",
    state: "Delhi",
    pincode: "110009",
    country: "India" as const,
  };

  it("Simulator initiates payment with redirectUrl and verifies callback successfully", async () => {
    const simulator = new SimulatorPaymentProvider();
    const init = await simulator.initiatePayment({
      orderId: "order-1",
      orderReference: "VAP-TEST-001",
      amountMinor: 59900,
      customerName: "Vivan Mittal",
      customerEmail: "vivan@example.com",
      customerPhone: "9310039258",
      returnUrl: "http://localhost:3000/api/paytm/callback",
    });

    expect(init.isSimulator).toBe(true);
    expect(init.redirectUrl).toContain("VAP-TEST-001");
    expect(init.redirectUrl).toContain("59900");

    const callback = await simulator.verifyCallback({
      orderRef: "VAP-TEST-001",
      amountMinor: "59900",
      status: "success",
      txnId: "SIM_TXN_123",
    });

    expect(callback.success).toBe(true);
    expect(callback.amountMinor).toBe(59900);
    expect(callback.orderReference).toBe("VAP-TEST-001");
  });

  it("Paytm provider generates signature and verifies callback with matching checksum", async () => {
    const paytm = new PaytmPaymentProvider({
      mid: "TEST_MID_123",
      merchantKey: "TEST_MERCHANT_KEY_456",
      website: "WEBSTAGING",
      environment: "staging",
    });

    const init = await paytm.initiatePayment({
      orderId: "order-2",
      orderReference: "VAP-TEST-002",
      amountMinor: 59900,
      customerName: "Pulkit Garg",
      customerEmail: "pulkit@example.com",
      customerPhone: "9311516813",
      returnUrl: "http://localhost:3000/api/paytm/callback",
    });

    expect(init.provider).toBe("paytm");
    expect(init.formFields).toBeDefined();
    expect(init.formFields?.TXN_AMOUNT).toBe("599.00");
    expect(init.formFields?.CHECKSUMHASH).toBeDefined();

    // Verify callback with the generated checksum
    const callback = await paytm.verifyCallback(init.formFields!);
    expect(callback.checksumValid).toBe(true);
  });

  it("markOrderPaid rejects exact amount mismatch (PRD §24 Phase 5)", async () => {
    // Create an order
    const { order } = await createOrder({
      items: [
        {
          lineId: "line-1",
          productId: "00000000-0000-4000-8000-000000000001",
          productSlug: "spiral-conch-pink-crackle-bracelet",
          variantId: "var-001-standard",
          quantity: 1,
        },
      ],
      address: dummyAddress,
    });

    // Attempt to mark paid with tampered amount (e.g. 1 rupee instead of totalMinor)
    const tampered = markOrderPaid({
      orderReference: order.orderReference,
      providerTxnId: "TXN_TAMPER_001",
      amountMinor: 100, // 100 paise = ₹1
    });

    expect(tampered.success).toBe(false);
    expect(tampered.error).toContain("Payment amount mismatch");

    // Correct amount succeeds
    const correct = markOrderPaid({
      orderReference: order.orderReference,
      providerTxnId: "TXN_CORRECT_001",
      amountMinor: order.totalMinor,
    });

    expect(correct.success).toBe(true);
    expect(correct.order?.status).toBe("paid");
  });
});
