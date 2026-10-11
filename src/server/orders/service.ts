import crypto from "crypto";
import { CartLineIntent, ValidatedCartResponse } from "@/lib/cart/types";
import { validateAndPriceCart } from "@/server/cart/validator";
import { CheckoutAddress } from "@/lib/checkout/validation";
import { transitionOrder, OrderStatus } from "./state-machine";

export interface StoredOrder {
  id: string;
  orderReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: CheckoutAddress;
  status: OrderStatus;
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  accessToken: string;
  accessTokenHash: string;
  items: Array<{
    productId: string;
    variantId: string;
    productTitle: string;
    variantTitle: string;
    quantity: number;
    priceMinor: number;
    subtotalMinor: number;
    customization?: Record<string, unknown>;
  }>;
  stockReservations: Array<{
    variantId: string;
    quantity: number;
    expiresAt: string;
    status: "active" | "consumed" | "released";
  }>;
  createdAt: string;
  updatedAt: string;
}

// In-memory store fallback for development / testing when live DB is migrating
const memoryOrders = new Map<string, StoredOrder>();

function generateOrderReference(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `VAP-${dateStr}-${randomPart}`;
}

export async function createOrder(params: {
  items: CartLineIntent[];
  address: CheckoutAddress;
}): Promise<{
  order: StoredOrder;
  validatedCart: ValidatedCartResponse;
}> {
  // 1. Authoritative Server-side Re-pricing and stock check
  const validatedCart = await validateAndPriceCart(params.items);

  if (validatedCart.lines.length === 0) {
    throw new Error("Cannot create order with an empty cart");
  }

  // 2. Generate unique identifiers and tokens
  const orderId = crypto.randomUUID();
  const orderReference = generateOrderReference();
  const accessToken = crypto.randomBytes(24).toString("hex");
  const accessTokenHash = crypto.createHash("sha256").update(accessToken).digest("hex");

  // 3. ADR-005 Option A: 15-minute stock hold
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const stockReservations = validatedCart.lines.map((line) => ({
    variantId: line.variantId,
    quantity: line.quantity,
    expiresAt,
    status: "active" as const,
  }));

  const orderItems = validatedCart.lines.map((line) => ({
    productId: line.productId,
    variantId: line.variantId,
    productTitle: line.productName,
    variantTitle: line.variantName,
    quantity: line.quantity,
    priceMinor: line.priceMinor,
    subtotalMinor: line.subtotalMinor,
    customization: line.customization as Record<string, unknown> | undefined,
  }));

  const storedOrder: StoredOrder = {
    id: orderId,
    orderReference,
    customerName: params.address.fullName,
    customerEmail: params.address.email,
    customerPhone: params.address.phone,
    shippingAddress: params.address,
    status: "payment_initiated",
    subtotalMinor: validatedCart.subtotalMinor,
    shippingMinor: validatedCart.shippingMinor,
    discountMinor: validatedCart.discountMinor,
    totalMinor: validatedCart.totalMinor,
    currency: "INR",
    accessToken,
    accessTokenHash,
    items: orderItems,
    stockReservations,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryOrders.set(orderReference, storedOrder);

  return {
    order: storedOrder,
    validatedCart,
  };
}

export function getOrderByReference(orderReference: string): StoredOrder | null {
  return memoryOrders.get(orderReference) || null;
}

export function markOrderPaid(params: {
  orderReference: string;
  providerTxnId: string;
  amountMinor: number;
}): { success: boolean; error?: string; order?: StoredOrder } {
  const order = memoryOrders.get(params.orderReference);
  if (!order) {
    return { success: false, error: "Order not found" };
  }

  // PRD §24 Phase 5 Rule: Reject exact amount mismatch!
  if (params.amountMinor !== order.totalMinor) {
    return {
      success: false,
      error: `Payment amount mismatch: expected ${order.totalMinor} paise, got ${params.amountMinor} paise`,
    };
  }

  const transition = transitionOrder(order.status, "paid");
  if (!transition.success) {
    return { success: false, error: transition.reason };
  }

  order.status = "paid";
  order.updatedAt = new Date().toISOString();

  // Consume stock reservations
  for (const res of order.stockReservations) {
    res.status = "consumed";
  }

  return { success: true, order };
}

export function markOrderFailed(params: {
  orderReference: string;
  reason?: string;
}): { success: boolean; error?: string } {
  const order = memoryOrders.get(params.orderReference);
  if (!order) {
    return { success: false, error: "Order not found" };
  }

  const transition = transitionOrder(order.status, "failed");
  if (!transition.success) {
    return { success: false, error: transition.reason };
  }

  order.status = "failed";
  order.updatedAt = new Date().toISOString();

  // Release stock reservations back to inventory
  for (const res of order.stockReservations) {
    res.status = "released";
  }

  return { success: true };
}
