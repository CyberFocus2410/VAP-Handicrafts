import { describe, it, expect } from "vitest";
import {
  createOrder,
  markOrderPaid,
  markOrderShipped,
  markOrderFulfilled,
  listAllOrders,
} from "@/server/orders/service";

describe("Phase 6 Admin Order Processing & Fulfillment Transitions", () => {
  it("transitions order through full fulfillment lifecycle: paid -> shipped -> fulfilled", async () => {
    // 1. Create order
    const { order } = await createOrder({
      items: [
        {
          lineId: "line-test-1",
          productId: "prod-bracelet-spiral-conch",
          productSlug: "spiral-conch-pink-crackle-bracelet",
          variantId: "var-spiral-conch-pink",
          quantity: 1,
        },
      ],
      address: {
        fullName: "Rohan Verma",
        phone: "9876543210",
        email: "rohan@example.com",
        streetAddress: "12 Marine Lines",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400020",
        country: "India",
      },
    });

    expect(order.status).toBe("payment_initiated");

    // 2. Mark Paid
    const paidRes = markOrderPaid({
      orderReference: order.orderReference,
      providerTxnId: "TXN_SIM_TEST_123",
      amountMinor: order.totalMinor,
    });
    expect(paidRes.success).toBe(true);
    expect(paidRes.order?.status).toBe("paid");

    // 3. Mark Shipped
    const shipRes = markOrderShipped({
      orderReference: order.orderReference,
      trackingNumber: "DTDC-445566",
      courierName: "DTDC Express",
    });
    expect(shipRes.success).toBe(true);
    expect(shipRes.order?.status).toBe("shipped");
    expect(shipRes.order?.trackingNumber).toBe("DTDC-445566");
    expect(shipRes.order?.courierName).toBe("DTDC Express");
    expect(shipRes.order?.shippedAt).toBeDefined();

    // 4. Mark Fulfilled
    const fulfillRes = markOrderFulfilled({
      orderReference: order.orderReference,
    });
    expect(fulfillRes.success).toBe(true);
    expect(fulfillRes.order?.status).toBe("fulfilled");

    // 5. Verify in list
    const allOrders = listAllOrders();
    const found = allOrders.find((o) => o.orderReference === order.orderReference);
    expect(found).toBeDefined();
    expect(found?.status).toBe("fulfilled");
  });

  it("rejects marking an unpaid order as shipped", async () => {
    const { order } = await createOrder({
      items: [
        {
          lineId: "line-test-2",
          productId: "prod-bracelet-spiral-conch",
          productSlug: "spiral-conch-pink-crackle-bracelet",
          variantId: "var-spiral-conch-pink",
          quantity: 1,
        },
      ],
      address: {
        fullName: "Test Customer",
        phone: "9876543210",
        email: "test@example.com",
        streetAddress: "Test Street",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
        country: "India",
      },
    });

    // Attempt to ship while still payment_initiated
    const shipRes = markOrderShipped({
      orderReference: order.orderReference,
      trackingNumber: "TEST-TRACK-99",
      courierName: "Blue Dart",
    });

    expect(shipRes.success).toBe(false);
    expect(shipRes.error).toContain("Illegal transition from payment_initiated to shipped");
  });
});
