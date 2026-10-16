import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getShippingConfig,
  updateShippingConfig,
  listDiscountCoupons,
  createDiscountCoupon,
  updateDiscountCoupon,
  deleteDiscountCoupon,
} from "@/server/admin/promotions-service";

export async function GET() {
  try {
    const [shipping, coupons] = await Promise.all([
      getShippingConfig(),
      listDiscountCoupons(),
    ]);

    return NextResponse.json({
      success: true,
      shipping,
      coupons,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load promotions";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "update_shipping") {
      const { shipping } = body;
      if (!shipping) {
        return NextResponse.json({ success: false, error: "Missing shipping config" }, { status: 400 });
      }
      const updated = await updateShippingConfig({
        standardShippingPaise: Number(shipping.standardShippingPaise),
        freeShippingThresholdPaise: Number(shipping.freeShippingThresholdPaise),
        freeShippingEnabled: Boolean(shipping.freeShippingEnabled),
      });

      revalidatePath("/cart");
      revalidatePath("/checkout");
      return NextResponse.json({ success: true, shipping: updated });
    }

    if (action === "create_coupon") {
      const { coupon } = body;
      if (!coupon || !coupon.code || !coupon.value) {
        return NextResponse.json({ success: false, error: "Invalid coupon payload" }, { status: 400 });
      }
      const created = await createDiscountCoupon({
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: Number(coupon.value),
        minOrderMinor: Number(coupon.minOrderMinor || 0),
        isActive: coupon.isActive !== undefined ? Boolean(coupon.isActive) : true,
        isVisibleOnStorefront:
          coupon.isVisibleOnStorefront !== undefined
            ? Boolean(coupon.isVisibleOnStorefront)
            : false,
      });

      revalidatePath("/cart");
      revalidatePath("/checkout");
      return NextResponse.json({ success: true, coupon: created });
    }

    if (action === "update_coupon") {
      const { id, patch } = body;
      if (!id || !patch) {
        return NextResponse.json({ success: false, error: "Missing id or patch" }, { status: 400 });
      }
      const updated = await updateDiscountCoupon(id, patch);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
      }

      revalidatePath("/cart");
      revalidatePath("/checkout");
      return NextResponse.json({ success: true, coupon: updated });
    }

    if (action === "delete_coupon") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: "Missing coupon id" }, { status: 400 });
      }
      await deleteDiscountCoupon(id);

      revalidatePath("/cart");
      revalidatePath("/checkout");
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process promotions request";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
