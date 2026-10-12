import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { CartLineIntentSchema } from "@/lib/cart/types";
import { validateAndPriceCart } from "@/server/cart/validator";

const ValidateCartPayloadSchema = z.object({
  items: z.array(CartLineIntentSchema),
  couponCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ValidateCartPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid cart payload",
          details: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const result = await validateAndPriceCart(parsed.data.items, parsed.data.couponCode);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal cart validation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
