import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/server/admin/auth";
import {
  getVapidPublicKey,
  savePushSubscription,
  sendPushNotificationToAdmins,
  listPushSubscriptions,
} from "@/server/notifications/push-service";

export async function GET() {
  return NextResponse.json({
    success: true,
    publicKey: getVapidPublicKey(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("vap_admin_session")?.value;
    const isAuthed = await verifyAdminSessionToken(sessionCookie);

    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin session required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action === "subscribe") {
      const { subscription, userAgent } = body;
      if (!subscription || !subscription.endpoint || !subscription.keys) {
        return NextResponse.json(
          { success: false, error: "Invalid PushSubscription payload" },
          { status: 400 }
        );
      }

      await savePushSubscription({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent: userAgent || "Mobile Browser",
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: "Push notifications successfully enabled on this mobile device!",
      });
    }

    if (action === "test") {
      const subs = await listPushSubscriptions();
      if (subs.length === 0) {
        return NextResponse.json({
          success: false,
          error: "No active push subscriptions found. Please enable notifications on your mobile device first.",
        });
      }

      const res = await sendPushNotificationToAdmins({
        title: "✨ VAP Handicrafts Push Test",
        body: "Your phone is connected! You will now receive instant alerts whenever a patron places an order or sends payment.",
        url: "/admin/orders",
        tag: "vap-test-push",
      });

      return NextResponse.json({
        success: true,
        message: `Test notification sent! Delivered to ${res.successCount} active device(s).`,
        details: res,
      });
    }

    return NextResponse.json(
      { success: false, error: `Invalid action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[AdminPushAPI] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
