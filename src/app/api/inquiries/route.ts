import { NextRequest, NextResponse } from "next/server";
import { createCustomerInquiry } from "@/server/admin/crm-service";
import { z } from "zod";

const InquiryInputSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  occasion: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = InquiryInputSchema.parse(body);

    const inquiry = await createCustomerInquiry(validated);

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
