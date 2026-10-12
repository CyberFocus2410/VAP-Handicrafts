import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CartLineIntentSchema } from "@/lib/cart/types";
import { CheckoutAddressSchema } from "@/lib/checkout/validation";
import { createOrder } from "@/server/orders/service";
import { getPaymentProvider } from "@/server/payments/factory";

const CreateOrderPayloadSchema = z.object({
  items: z.array(CartLineIntentSchema).min(1, "Cart cannot be empty"),
  address: CheckoutAddressSchema,
  couponCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateOrderPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout submission", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { order, validatedCart } = await createOrder({
      items: parsed.data.items,
      address: parsed.data.address,
      couponCode: parsed.data.couponCode,
    });

    const provider = getPaymentProvider();
    const origin = req.nextUrl.origin;
    const returnUrl = `${origin}/api/paytm/callback`;

    const paymentResult = await provider.initiatePayment({
      orderId: order.id,
      orderReference: order.orderReference,
      amountMinor: validatedCart.totalMinor,
      customerName: parsed.data.address.fullName,
      customerEmail: parsed.data.address.email,
      customerPhone: parsed.data.address.phone,
      returnUrl,
    });

    return NextResponse.json({
      success: true,
      orderReference: order.orderReference,
      accessToken: order.accessToken,
      totalMinor: order.totalMinor,
      payment: paymentResult,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
