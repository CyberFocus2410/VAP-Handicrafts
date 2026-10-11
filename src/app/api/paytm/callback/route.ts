import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/server/payments/factory";
import { markOrderPaid, markOrderFailed } from "@/server/orders/service";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let payload: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        if (typeof value === "string") {
          payload[key] = value;
        }
      });
    } else {
      payload = await req.json();
    }

    const provider = getPaymentProvider();
    const verification = await provider.verifyCallback(payload);

    const origin = req.nextUrl.origin;
    const isJson = contentType.includes("application/json");

    if (!verification.success) {
      if (verification.orderReference) {
        markOrderFailed({
          orderReference: verification.orderReference,
          reason: verification.errorMessage || "Payment verification failed",
        });
      }
      const failTarget = `/order/${encodeURIComponent(
        verification.orderReference || "unknown"
      )}?status=failed&error=${encodeURIComponent(
        verification.errorMessage || "Payment verification failed"
      )}`;

      if (isJson) {
        return NextResponse.json({ success: false, redirectUrl: failTarget });
      }
      return NextResponse.redirect(`${origin}${failTarget}`, 303);
    }

    // Mark paid with authoritative amount check
    const paidResult = markOrderPaid({
      orderReference: verification.orderReference,
      providerTxnId: verification.providerTxnId,
      amountMinor: verification.amountMinor,
    });

    if (!paidResult.success) {
      const errTarget = `/order/${encodeURIComponent(
        verification.orderReference
      )}?status=failed&error=${encodeURIComponent(paidResult.error || "Order update failed")}`;

      if (isJson) {
        return NextResponse.json({ success: false, redirectUrl: errTarget });
      }
      return NextResponse.redirect(`${origin}${errTarget}`, 303);
    }

    const successTarget = `/order/${encodeURIComponent(verification.orderReference)}?status=paid`;
    if (isJson) {
      return NextResponse.json({ success: true, redirectUrl: successTarget });
    }
    return NextResponse.redirect(`${origin}${successTarget}`, 303);
  } catch (err: unknown) {
    console.error("Paytm callback error detail:", err);
    const message = err instanceof Error ? err.message : "Payment callback error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Support GET redirect callbacks
  const searchParams = req.nextUrl.searchParams;
  const payload: Record<string, string> = {};
  searchParams.forEach((v, k) => {
    payload[k] = v;
  });

  const provider = getPaymentProvider();
  const verification = await provider.verifyCallback(payload);
  const origin = req.nextUrl.origin;

  if (verification.success && verification.orderReference) {
    markOrderPaid({
      orderReference: verification.orderReference,
      providerTxnId: verification.providerTxnId,
      amountMinor: verification.amountMinor,
    });
    return NextResponse.redirect(`${origin}/order/${verification.orderReference}?status=paid`);
  }

  return NextResponse.redirect(`${origin}/order/${verification.orderReference || "error"}?status=failed`);
}
