import { NextRequest, NextResponse } from "next/server";
import {
  listAllOrders,
  markOrderShipped,
  markOrderFulfilled,
  getOrderByReference,
} from "@/server/orders/service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";

    const orders = listAllOrders({ status });
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
    const body = await request.json();
    const { action, orderReference, trackingNumber, courierName } = body;

    if (!orderReference) {
      return NextResponse.json(
        { success: false, error: "orderReference is required" },
        { status: 400 }
      );
    }

    const order = getOrderByReference(orderReference);
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

      const res = markOrderShipped({
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

    if (action === "mark_fulfilled") {
      const res = markOrderFulfilled({ orderReference });
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
