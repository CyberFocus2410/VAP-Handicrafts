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

    let finalProofUrl = parsed.data.paymentProofUrl;

    if (finalProofUrl.startsWith("data:image/")) {
      try {
        const matches = finalProofUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches && matches[1] && matches[2]) {
          const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
          const buffer = Buffer.from(matches[2], "base64");
          const filename = `${parsed.data.orderReference}-${Date.now()}.${ext}`;

          const { getSupabaseAdminClient } = await import("@/server/db/supabase");
          const supabase = getSupabaseAdminClient();

          let uploaded = false;
          const { error: uploadError } = await supabase.storage
            .from("order-proofs")
            .upload(filename, buffer, {
              contentType: `image/${matches[1]}`,
              upsert: true,
            });

          if (!uploadError) {
            const { data: signedData } = await supabase.storage
              .from("order-proofs")
              .createSignedUrl(filename, 60 * 60 * 24 * 365); // 1 year

            if (signedData?.signedUrl) {
              finalProofUrl = signedData.signedUrl;
              uploaded = true;
            }
          }

          // Fallback if order-proofs bucket is missing or unconfigured
          if (!uploaded) {
            const fbPath = `proofs/${filename}`;
            const { error: fbErr } = await supabase.storage
              .from("product-media")
              .upload(fbPath, buffer, {
                contentType: `image/${matches[1]}`,
                upsert: true,
              });

            if (!fbErr) {
              const { data: pubData } = supabase.storage
                .from("product-media")
                .getPublicUrl(fbPath);
              if (pubData?.publicUrl) {
                finalProofUrl = pubData.publicUrl;
              }
            }
          }
        }
      } catch (uploadErr) {
        console.warn("[ProofUpload] Supabase storage upload notice:", uploadErr);
      }
    }

    const res = await submitPaymentProof({
      orderReference: parsed.data.orderReference,
      paymentProofUrl: finalProofUrl,
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
