import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitPaymentProof } from "@/server/orders/service";

const SubmitProofSchema = z.object({
  orderReference: z.string().min(1, "Order reference is required"),
  paymentProofUrl: z.string().min(1, "Payment screenshot is required"),
  paymentUtr: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SubmitProofSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payment proof submission", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const res = submitPaymentProof({
      orderReference: parsed.data.orderReference,
      paymentProofUrl: parsed.data.paymentProofUrl,
      paymentUtr: parsed.data.paymentUtr,
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
      message: "Payment proof submitted successfully! Verification in progress.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit payment proof";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
