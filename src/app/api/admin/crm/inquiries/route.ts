import { NextRequest, NextResponse } from "next/server";
import {
  listAllInquiries,
  createCustomerInquiry,
  updateCustomerInquiry,
} from "@/server/admin/crm-service";
import { InquiryStatus } from "@/server/admin/crm-cms-types";

export async function GET() {
  try {
    const inquiries = await listAllInquiries();
    return NextResponse.json({
      success: true,
      inquiries,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load inquiries";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, patch, newInquiry } = body;

    if (action === "update" && id) {
      const updated = await updateCustomerInquiry(
        id,
        patch as Partial<{
          status: InquiryStatus;
          assignedTo: string;
          quoteMinor: number;
          internalNotes: string;
        }>
      );
      return NextResponse.json({ success: true, inquiry: updated });
    }

    if (action === "create" && newInquiry) {
      const created = await createCustomerInquiry({
        name: newInquiry.name,
        email: newInquiry.email,
        phone: newInquiry.phone,
        occasion: newInquiry.occasion,
        message: newInquiry.message,
      });
      return NextResponse.json({ success: true, inquiry: created });
    }

    return NextResponse.json({ success: false, error: "Invalid inquiry request action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process inquiry";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
