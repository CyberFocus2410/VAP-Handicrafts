import { NextRequest, NextResponse } from "next/server";
import { createCustomerInquiry } from "@/server/admin/crm-service";
import { z } from "zod";

const InquiryInputSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  occasion: z.string().optional(),
  message: z.string().min(3, "Please enter your message or custom request"),
  website: z.string().optional(), // Honeypot field
  turnstileToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Honeypot check: If the hidden 'website' field was filled out, it's a bot
    if (body.website && typeof body.website === "string" && body.website.trim().length > 0) {
      console.warn("[Spam Protection] Honeypot triggered, blocking automated bot submission.");
      return NextResponse.json(
        { success: true, message: "Inquiry received.", inquiryId: "bot-filtered" },
        { status: 200 }
      );
    }

    // 2. Cloudflare Turnstile Verification (if secret key configured)
    const turnstileSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    const clientToken = body.turnstileToken || body["cf-turnstile-response"];

    if (turnstileSecret && clientToken) {
      const clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "";
      try {
        const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: turnstileSecret,
            response: clientToken,
            remoteip: clientIp,
          }),
        });
        const outcome = await verifyRes.json();
        if (!outcome.success) {
          console.warn("[Spam Protection] Cloudflare Turnstile check failed:", outcome);
          return NextResponse.json(
            { success: false, error: "Spam verification failed. Please refresh and try again." },
            { status: 403 }
          );
        }
      } catch (verifyErr) {
        console.warn("[Spam Protection] Turnstile verification network error:", verifyErr);
      }
    }

    const validated = InquiryInputSchema.parse(body);

    const inquiry = await createCustomerInquiry({
      name: validated.name,
      email: validated.email,
      phone: validated.phone,
      occasion: validated.occasion,
      message: validated.message,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! Pulkit or Vivan will get in touch shortly via WhatsApp / Email.",
      inquiryId: inquiry.id,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to submit inquiry";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
