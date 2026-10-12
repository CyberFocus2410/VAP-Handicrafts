import crypto from "crypto";
import { CartLineIntent, ValidatedCartResponse } from "@/lib/cart/types";
import { validateAndPriceCart } from "@/server/cart/validator";
import { CheckoutAddress } from "@/lib/checkout/validation";
import { transitionOrder, OrderStatus } from "./state-machine";
import { enqueueOrderPaidEmails, enqueueEmail } from "@/server/email/outbox";
import { EmailOrderDetails } from "@/server/email/types";
import { getSupabaseAdminClient } from "@/server/db/supabase";

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
  trackingNumber?: string;
  courierName?: string;
  shippedAt?: string;
  paymentProofUrl?: string;
  paymentUtr?: string;
  paymentProofSubmittedAt?: string;
  paymentVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory store fallback for development / testing when live DB is migrating
const globalWithOrders = globalThis as typeof globalThis & {
  __vapMemoryOrders?: Map<string, StoredOrder>;
};
const memoryOrders: Map<string, StoredOrder> =
  globalWithOrders.__vapMemoryOrders ?? (globalWithOrders.__vapMemoryOrders = new Map<string, StoredOrder>());

export async function logAdminAudit(params: {
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("admin_audit_logs").insert({
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      details: params.details,
      ip_address: params.ipAddress || null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[AuditLog] Notice:", err);
  }
}

export async function syncOrderToSupabase(order: StoredOrder) {
  try {
    const supabase = getSupabaseAdminClient();
    const mappedStatus =
      order.status === "payment_proof_submitted" || order.status === "shipped"
        ? (order.status === "shipped" ? "fulfilled" : "payment_initiated")
        : order.status;

    await supabase.from("orders").upsert(
      {
        id: order.id,
        order_reference: order.orderReference,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        shipping_street: order.shippingAddress.streetAddress,
        shipping_city: order.shippingAddress.city,
        shipping_state: order.shippingAddress.state,
        shipping_pincode: order.shippingAddress.pincode,
        shipping_country: order.shippingAddress.country || "India",
        status: mappedStatus,
        subtotal_minor: order.subtotalMinor,
        shipping_minor: order.shippingMinor,
        discount_minor: order.discountMinor,
        total_minor: order.totalMinor,
        currency: order.currency || "INR",
        access_token_hash: order.accessTokenHash,
        tracking_number: order.trackingNumber || null,
        courier_name: order.courierName || null,
        shipped_at: order.shippedAt || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    // Sync full order metadata into site_settings so rich fields (screenshot, items, UTR) persist
    const { data: row } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "order_metadata")
      .maybeSingle();

    const existing = (row?.value as Record<string, any>) || {};
    existing[order.orderReference] = order;

    await supabase.from("site_settings").upsert(
      {
        key: "order_metadata",
        value: existing,
        is_public: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
  } catch (err) {
    console.warn("[OrdersService] Supabase sync notice:", err);
  }
}

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
  syncOrderToSupabase(storedOrder).catch((e) => console.warn("Supabase order sync warning:", e));

  // Trigger Web Push notification to owner mobile (non-blocking)
  import("@/server/notifications/push-service")
    .then(({ sendPushNotificationToAdmins }) => {
      sendPushNotificationToAdmins({
        title: `🐚 New Order! ₹${(storedOrder.totalMinor / 100).toLocaleString("en-IN")}`,
        body: `${storedOrder.customerName} placed order ${storedOrder.orderReference}. Items: ${storedOrder.items.length}.`,
        url: "/admin/orders",
        tag: `order-${storedOrder.orderReference}`,
      }).catch((e) => console.warn("[OrdersService] Push dispatch warning:", e));
    })
    .catch(() => {});

  return {
    order: storedOrder,
    validatedCart,
  };
}

export function getOrderByReference(orderReference: string): StoredOrder | null {
  return memoryOrders.get(orderReference) || null;
}

export function submitPaymentProof(params: {
  orderReference: string;
  paymentProofUrl: string;
  paymentUtr?: string;
}): { success: boolean; error?: string; order?: StoredOrder } {
  const order = memoryOrders.get(params.orderReference);
  if (!order) {
    return { success: false, error: "Order not found" };
  }

  const transition = transitionOrder(order.status, "payment_proof_submitted");
  if (!transition.success && order.status !== "payment_proof_submitted") {
    return { success: false, error: transition.reason };
  }

  order.status = "payment_proof_submitted";
  order.paymentProofUrl = params.paymentProofUrl;
  if (params.paymentUtr) {
    order.paymentUtr = params.paymentUtr.trim();
  }
  order.paymentProofSubmittedAt = new Date().toISOString();
  order.updatedAt = new Date().toISOString();

  syncOrderToSupabase(order).catch((e) => console.warn("Supabase proof sync warning:", e));

  // Trigger Web Push notification to owner mobile for payment screenshot verification
  import("@/server/notifications/push-service")
    .then(({ sendPushNotificationToAdmins }) => {
      sendPushNotificationToAdmins({
        title: `📸 Payment Proof Received!`,
        body: `Order ${order.orderReference} (${order.customerName}): Payment screenshot uploaded. Tap to verify.`,
        url: "/admin/orders",
        tag: `proof-${order.orderReference}`,
      }).catch((e) => console.warn("[OrdersService] Push dispatch warning:", e));
    })
    .catch(() => {});

  return { success: true, order };
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

  const previousStatus = order.status;
  order.status = "paid";
  order.paymentVerifiedAt = new Date().toISOString();
  order.updatedAt = new Date().toISOString();

  // Consume stock reservations
  for (const res of order.stockReservations) {
    res.status = "consumed";
  }

  syncOrderToSupabase(order).catch((e) => console.warn("Supabase order paid sync warning:", e));

  logAdminAudit({
    action: "verify_payment",
    entityType: "order",
    entityId: order.orderReference,
    details: {
      previousStatus,
      newStatus: "paid",
      providerTxnId: params.providerTxnId,
      amountMinor: params.amountMinor,
      verifiedAt: order.paymentVerifiedAt,
    },
  }).catch((e) => console.warn("Audit log warning:", e));

  // PRD Phase 6: Transactional Outbox trigger for order confirmation + admin notification
  const emailDetails: EmailOrderDetails = {
    orderReference: order.orderReference,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: {
      fullName: order.shippingAddress.fullName,
      streetAddress: order.shippingAddress.streetAddress,
      apartment: order.shippingAddress.apartment,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
      country: order.shippingAddress.country,
    },
    items: order.items.map((i) => ({
      productTitle: i.productTitle,
      variantTitle: i.variantTitle,
      quantity: i.quantity,
      priceMinor: i.priceMinor,
      subtotalMinor: i.subtotalMinor,
      customization: i.customization,
    })),
    subtotalMinor: order.subtotalMinor,
    shippingMinor: order.shippingMinor,
    discountMinor: order.discountMinor,
    totalMinor: order.totalMinor,
  };

  enqueueOrderPaidEmails(emailDetails, order.id).catch((err) => {
    console.error("[OrdersService] Failed to enqueue paid order emails:", err);
  });

  return { success: true, order };
}

export function markOrderShipped(params: {
  orderReference: string;
  trackingNumber: string;
  courierName: string;
}): { success: boolean; error?: string; order?: StoredOrder } {
  const order = memoryOrders.get(params.orderReference);
  if (!order) {
    return { success: false, error: "Order not found" };
  }

  const transition = transitionOrder(order.status, "shipped");
  if (!transition.success) {
    return { success: false, error: transition.reason };
  }

  const previousStatus = order.status;
  order.status = "shipped";
  order.trackingNumber = params.trackingNumber.trim();
  order.courierName = params.courierName.trim();
  order.shippedAt = new Date().toISOString();
  order.updatedAt = new Date().toISOString();

  syncOrderToSupabase(order).catch((e) => console.warn("Supabase ship sync warning:", e));

  logAdminAudit({
    action: "mark_shipped",
    entityType: "order",
    entityId: order.orderReference,
    details: {
      previousStatus,
      newStatus: "shipped",
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      shippedAt: order.shippedAt,
    },
  }).catch((e) => console.warn("Audit log warning:", e));

  // PRD Phase 6: Trigger shipping confirmation email to customer
  const emailDetails: EmailOrderDetails = {
    orderReference: order.orderReference,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: {
      fullName: order.shippingAddress.fullName,
      streetAddress: order.shippingAddress.streetAddress,
      apartment: order.shippingAddress.apartment,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
      country: order.shippingAddress.country,
    },
    items: order.items.map((i) => ({
      productTitle: i.productTitle,
      variantTitle: i.variantTitle,
      quantity: i.quantity,
      priceMinor: i.priceMinor,
      subtotalMinor: i.subtotalMinor,
      customization: i.customization,
    })),
    subtotalMinor: order.subtotalMinor,
    shippingMinor: order.shippingMinor,
    discountMinor: order.discountMinor,
    totalMinor: order.totalMinor,
    trackingNumber: order.trackingNumber,
    courierName: order.courierName,
  };

  enqueueEmail({
    orderId: order.id,
    recipientEmail: order.customerEmail,
    templateType: "order_shipped_buyer",
    details: emailDetails,
  }).catch((err) => {
    console.error("[OrdersService] Failed to enqueue order shipped email:", err);
  });

  return { success: true, order };
}

export function markOrderFulfilled(params: {
  orderReference: string;
}): { success: boolean; error?: string; order?: StoredOrder } {
  const order = memoryOrders.get(params.orderReference);
  if (!order) {
    return { success: false, error: "Order not found" };
  }

  const transition = transitionOrder(order.status, "fulfilled");
  if (!transition.success) {
    return { success: false, error: transition.reason };
  }

  const previousStatus = order.status;
  order.status = "fulfilled";
  order.updatedAt = new Date().toISOString();

  syncOrderToSupabase(order).catch((e) => console.warn("Supabase fulfill sync warning:", e));

  logAdminAudit({
    action: "mark_fulfilled",
    entityType: "order",
    entityId: order.orderReference,
    details: {
      previousStatus,
      newStatus: "fulfilled",
      fulfilledAt: order.updatedAt,
    },
  }).catch((e) => console.warn("Audit log warning:", e));

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

  const previousStatus = order.status;
  order.status = "failed";
  order.updatedAt = new Date().toISOString();

  // Release stock reservations back to inventory
  for (const res of order.stockReservations) {
    res.status = "released";
  }

  syncOrderToSupabase(order).catch((e) => console.warn("Supabase order fail sync warning:", e));

  logAdminAudit({
    action: "reject_payment",
    entityType: "order",
    entityId: order.orderReference,
    details: {
      previousStatus,
      newStatus: "failed",
      reason: params.reason || "Payment proof rejected",
      updatedAt: order.updatedAt,
    },
  }).catch((e) => console.warn("Audit log warning:", e));

  return { success: true };
}

export function listAllOrders(filter?: { status?: string }): StoredOrder[] {
  let list = Array.from(memoryOrders.values());
  if (filter?.status && filter.status !== "all") {
    list = list.filter((o) => o.status === filter.status);
  }
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

