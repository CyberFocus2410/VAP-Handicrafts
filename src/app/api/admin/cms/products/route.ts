import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  listCmsProducts,
  createCmsProduct,
  updateCmsProduct,
  deleteCmsProduct,
} from "@/server/admin/cms-service";

export async function GET() {
  try {
    const products = await listCmsProducts();
    return NextResponse.json({
      success: true,
      products,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load products";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, patch, product } = body;

    if (action === "update" && id) {
      const updated = await updateCmsProduct(id, patch);
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/shop/[category]", "page");
      revalidatePath("/products");
      return NextResponse.json({ success: true, product: updated });
    }

    if (action === "create" && product) {
      const created = await createCmsProduct(product);
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/shop/[category]", "page");
      revalidatePath("/products");
      return NextResponse.json({ success: true, product: created });
    }

    return NextResponse.json({ success: false, error: "Invalid product action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process product";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing product id" }, { status: 400 });
    }

    await deleteCmsProduct(id);
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/shop/[category]", "page");
    revalidatePath("/products");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete product";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
