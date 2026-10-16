import { NextRequest, NextResponse } from "next/server";
import {
  listAllCustomers,
  saveCustomerNotesAndTags,
  deleteCustomerProfile,
} from "@/server/admin/crm-service";
import { verifyAdminSessionToken } from "@/server/admin/auth";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("vap_admin_session")?.value;
    const isAuthed = await verifyAdminSessionToken(sessionCookie);
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const customers = await listAllCustomers();
    return NextResponse.json({
      success: true,
      customers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load customers";
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
    const { action, customerKey, tags, internalNotes } = body;

    if (!customerKey) {
      return NextResponse.json(
        { success: false, error: "customerKey is required" },
        { status: 400 }
      );
    }

    if (action === "delete") {
      await deleteCustomerProfile(customerKey);
      return NextResponse.json({ success: true, message: "Customer profile deleted." });
    }

    const updated = await saveCustomerNotesAndTags(
      customerKey,
      Array.isArray(tags) ? tags : [],
      typeof internalNotes === "string" ? internalNotes : ""
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update customer";
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
    const customerKey = searchParams.get("customerKey") || searchParams.get("key");
    if (!customerKey) {
      return NextResponse.json({ success: false, error: "customerKey is required" }, { status: 400 });
    }

    await deleteCustomerProfile(customerKey);
    return NextResponse.json({ success: true, message: "Customer profile deleted." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete customer";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

