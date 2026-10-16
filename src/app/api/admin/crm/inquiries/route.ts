import { NextRequest, NextResponse } from "next/server";
import {
  listAllInquiries,
  createCustomerInquiry,
  updateCustomerInquiry,
  deleteCustomerInquiry,
} from "@/server/admin/crm-service";
import { InquiryStatus } from "@/server/admin/crm-cms-types";
import { verifyAdminSessionToken } from "@/server/admin/auth";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("vap_admin_session")?.value;
    const isAuthed = await verifyAdminSessionToken(sessionCookie);
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin session required." }, { status: 401 });
    }

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
    const sessionCookie = req.cookies.get("vap_admin_session")?.value;
    const isAuthed = await verifyAdminSessionToken(sessionCookie);
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin session required." }, { status: 401 });
    }
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

    if (action === "delete" && id) {
      await deleteCustomerInquiry(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid inquiry request action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process inquiry";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("vap_admin_session")?.value;
    const isAuthed = await verifyAdminSessionToken(sessionCookie);
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing inquiry id" }, { status: 400 });
    }
    await deleteCustomerInquiry(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete inquiry";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
