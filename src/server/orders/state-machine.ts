// Pure state machine for Orders & Payments (PRD §12, §24 Phase 5)

export type OrderStatus =
  | "pending"
  | "payment_initiated"
  | "payment_proof_submitted"
  | "paid"
  | "shipped"
  | "failed"
  | "cancelled"
  | "expired"
  | "fulfilled";

export type PaymentStatus =
  | "created"
  | "pending"
  | "success"
  | "failed"
  | "cancelled"
  | "expired";

export interface TransitionResult<T> {
  success: boolean;
  nextState: T;
  reason?: string;
}

// Valid transitions for Order
const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["payment_initiated", "payment_proof_submitted", "cancelled", "expired"],
  payment_initiated: ["payment_proof_submitted", "paid", "failed", "cancelled", "expired"],
  payment_proof_submitted: ["paid", "failed", "cancelled"],
  paid: ["shipped", "fulfilled"], // can transition to shipped, or directly fulfilled
  shipped: ["fulfilled"],
  failed: ["payment_initiated", "payment_proof_submitted", "cancelled"], // allowed to retry with a new payment attempt
  cancelled: [], // terminal
  expired: [], // terminal
  fulfilled: [], // terminal
};

// Valid transitions for Payment Attempt
const VALID_PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  created: ["pending", "failed", "cancelled", "expired"],
  pending: ["success", "failed", "cancelled", "expired"],
  success: [], // terminal against failed or expired
  failed: [], // terminal for this specific attempt
  cancelled: [], // terminal
  expired: [], // terminal
};

/**
 * Transitions order state with strict guard checks.
 * Late failures arriving after an order is marked PAID are safely rejected.
 */
export function transitionOrder(
  currentState: OrderStatus,
  targetState: OrderStatus
): TransitionResult<OrderStatus> {
  // Guard against late failure if already paid
  if (currentState === "paid" && (targetState === "failed" || targetState === "expired")) {
    return {
      success: false,
      nextState: currentState,
      reason: "Order is already PAID; late failure or expiry event ignored",
    };
  }

  const allowed = VALID_ORDER_TRANSITIONS[currentState];
  if (!allowed.includes(targetState)) {
    return {
      success: false,
      nextState: currentState,
      reason: `Illegal transition from ${currentState} to ${targetState}`,
    };
  }

  return {
    success: true,
    nextState: targetState,
  };
}

/**
 * Transitions payment attempt state.
 */
export function transitionPayment(
  currentState: PaymentStatus,
  targetState: PaymentStatus
): TransitionResult<PaymentStatus> {
  // Guard against late failure if already marked success
  if (currentState === "success" && targetState === "failed") {
    return {
      success: false,
      nextState: currentState,
      reason: "Payment is already SUCCESS; late failure callback ignored",
    };
  }

  const allowed = VALID_PAYMENT_TRANSITIONS[currentState];
  if (!allowed.includes(targetState)) {
    return {
      success: false,
      nextState: currentState,
      reason: `Illegal transition from ${currentState} to ${targetState}`,
    };
  }

  return {
    success: true,
    nextState: targetState,
  };
}
