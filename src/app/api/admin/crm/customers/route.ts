import { NextRequest, NextResponse } from "next/server";
import { listAllCustomers, saveCustomerNotesAndTags } from "@/server/admin/crm-service";

export async function GET() {
  try {
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
    const body = await req.json();
    const { customerKey, tags, internalNotes } = body;

    if (!customerKey) {
      return NextResponse.json(
        { success: false, error: "customerKey is required" },
        { status: 400 }
      );
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
