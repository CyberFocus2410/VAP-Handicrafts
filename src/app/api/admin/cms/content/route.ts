import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getSiteContentConfig,
  updateSiteContentConfig,
} from "@/server/admin/cms-service";

export async function GET() {
  try {
    const config = await getSiteContentConfig();
    return NextResponse.json({
      success: true,
      config,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load site content";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patch } = body;

    if (!patch || typeof patch !== "object") {
      return NextResponse.json(
        { success: false, error: "Missing patch object" },
        { status: 400 }
      );
    }

    const updated = await updateSiteContentConfig(patch);
    try {
      revalidatePath("/");
      revalidatePath("/shop");
    } catch {
      // Non-fatal
    }
    return NextResponse.json({ success: true, config: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update site content";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
