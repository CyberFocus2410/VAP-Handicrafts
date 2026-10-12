import { NextRequest, NextResponse } from "next/server";
import {
  listAllOrders,
  markOrderShipped,
  markOrderFulfilled,
  getOrderByReference,
} from "@/server/orders/service";
import { verifyAdminSessionToken } from "@/server/admin/auth";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("vap_admin_session")?.value;
    const isAuthed = await verifyAdminSessionToken(sessionCookie);
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin session required." },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";

    const orders = await listAllOrders({ status });
    return NextResponse.json({
      success: true,
      orders,
      totalCount: orders.length,
    });
  } catch (error) {
    console.error("[AdminOrdersAPI] Failed to fetch orders:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("vap_admin_session")?.value;
    const isAuthed = await verifyAdminSessionToken(sessionCookie);
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin session required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, orderReference, trackingNumber, courierName } = body;

    if (!orderReference) {
      return NextResponse.json(
        { success: false, error: "orderReference is required" },
        { status: 400 }
      );
    }

    const order = await getOrderByReference(orderReference);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (action === "mark_shipped") {
      if (!trackingNumber || !courierName) {
        return NextResponse.json(
          {
            success: false,
            error: "trackingNumber and courierName are required to mark as shipped",
          },
          { status: 400 }
        );
      }

      const res = await markOrderShipped({
        orderReference,
        trackingNumber,
        courierName,
      });

      if (!res.success) {
        return NextResponse.json(
          { success: false, error: res.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        order: res.order,
        message: "Order marked as shipped. Notification email enqueued.",
      });
    }

    if (action === "verify_payment" || action === "mark_paid") {
      const { markOrderPaid } = await import("@/server/orders/service");
      const providerTxnId = body.providerTxnId || order.paymentUtr || `UPI-VERIFIED-${Date.now()}`;
      const res = await markOrderPaid({
        orderReference,
        providerTxnId,
        amountMinor: order.totalMinor,
      });

      if (!res.success) {
        return NextResponse.json(
          { success: false, error: res.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        order: res.order,
        message: "Payment successfully verified! Order marked as PAID and confirmation email enqueued to customer.",
      });
    }

    if (action === "reject_payment") {
      const { markOrderFailed } = await import("@/server/orders/service");
      const res = await markOrderFailed({
        orderReference,
        reason: body.reason || "Payment proof verification rejected by artisan admin",
      });

      if (!res.success) {
        return NextResponse.json(
          { success: false, error: res.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Payment proof rejected and order marked as failed.",
      });
    }

    if (action === "mark_fulfilled") {
      const res = await markOrderFulfilled({ orderReference });
      if (!res.success) {
        return NextResponse.json(
          { success: false, error: res.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        order: res.order,
        message: "Order marked as delivered / fulfilled.",
      });
    }

    return NextResponse.json(
      { success: false, error: `Invalid action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("[AdminOrdersAPI] Fulfillment update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
