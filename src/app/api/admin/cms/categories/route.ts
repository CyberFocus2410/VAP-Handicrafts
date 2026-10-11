import { NextRequest, NextResponse } from "next/server";
import {
  listCmsCategories,
  createCmsCategory,
  updateCmsCategory,
} from "@/server/admin/cms-service";

export async function GET() {
  try {
    const categories = await listCmsCategories();
    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load categories";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, patch, category } = body;

    if (action === "update" && id) {
      const updated = await updateCmsCategory(id, patch);
      return NextResponse.json({ success: true, category: updated });
    }

    if (action === "create" && category) {
      const created = await createCmsCategory(category);
      return NextResponse.json({ success: true, category: created });
    }

    return NextResponse.json({ success: false, error: "Invalid category action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process category";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
