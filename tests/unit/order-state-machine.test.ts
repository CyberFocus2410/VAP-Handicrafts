import { describe, it, expect } from "vitest";
import { transitionOrder, transitionPayment } from "@/server/orders/state-machine";

describe("Order State Machine (PRD §12)", () => {
  it("transitions pending -> payment_initiated -> paid", () => {
    const step1 = transitionOrder("pending", "payment_initiated");
    expect(step1.success).toBe(true);
    expect(step1.nextState).toBe("payment_initiated");

    const step2 = transitionOrder(step1.nextState, "paid");
    expect(step2.success).toBe(true);
    expect(step2.nextState).toBe("paid");
  });

  it("safely ignores late failed or expired events once order is paid (PRD §12 terminal rule)", () => {
    const lateFail = transitionOrder("paid", "failed");
    expect(lateFail.success).toBe(false);
    expect(lateFail.nextState).toBe("paid");
    expect(lateFail.reason).toContain("Order is already PAID");

    const lateExpiry = transitionOrder("paid", "expired");
    expect(lateExpiry.success).toBe(false);
    expect(lateExpiry.nextState).toBe("paid");
  });

  it("allows transition from failed back to payment_initiated to retry payment", () => {
    const retry = transitionOrder("failed", "payment_initiated");
    expect(retry.success).toBe(true);
    expect(retry.nextState).toBe("payment_initiated");
  });

  it("rejects illegal transitions", () => {
    const illegal = transitionOrder("pending", "fulfilled");
    expect(illegal.success).toBe(false);
    expect(illegal.nextState).toBe("pending");
  });
});

describe("Payment State Machine (PRD §12)", () => {
  it("transitions created -> pending -> success", () => {
    const step1 = transitionPayment("created", "pending");
    expect(step1.success).toBe(true);
    expect(step1.nextState).toBe("pending");

    const step2 = transitionPayment("pending", "success");
    expect(step2.success).toBe(true);
    expect(step2.nextState).toBe("success");
  });

  it("rejects late failed callback when payment is already success", () => {
    const lateFail = transitionPayment("success", "failed");
    expect(lateFail.success).toBe(false);
    expect(lateFail.nextState).toBe("success");
    expect(lateFail.reason).toContain("Payment is already SUCCESS");
  });
});
