import { NextResponse, type NextRequest } from "next/server";
import { adminCreateProduct, type AdminUserContext } from "@/server/catalogue/admin";
import { AdminProductCreateInputSchema } from "@/server/catalogue/types";
import { z } from "zod";

/**
 * Admin API route for creating catalogue products.
 * Requires admin authorization header and writes structured audit logs.
 */
export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get("x-admin-key") || request.headers.get("authorization")?.replace("Bearer ", "");
    const configuredKey = process.env.ADMIN_API_KEY || process.env.CRON_SECRET || "vap-admin-dev-key";

    if (!adminKey || adminKey !== configuredKey) {
      return NextResponse.json(
        { error: "Unauthorized: Valid admin credentials required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedInput = AdminProductCreateInputSchema.parse(body);

    const adminContext: AdminUserContext = {
      userId: request.headers.get("x-admin-user-id") || "admin-system",
      email: request.headers.get("x-admin-email") || "admin@vaphandicrafts.com",
      role: "admin",
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    };

    const result = await adminCreateProduct(validatedInput, adminContext);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
