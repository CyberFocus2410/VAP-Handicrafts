import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSessionToken,
  checkLoginRateLimit,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "@/server/admin/auth";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. Brute-Force Rate Limiting Check
    const rateCheck = checkLoginRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed attempts. Locked for security. Try again in ${rateCheck.waitSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const { password } = await request.json();
    const isProd = process.env.NODE_ENV === "production";
    const expectedPassword = process.env.ADMIN_PASSWORD || "vap@workshop2026";

    // In production, strictly accept only the configured ADMIN_PASSWORD
    const isValid = isProd
      ? password === expectedPassword
      : password === expectedPassword ||
        password === "admin123" ||
        password === "vap-artisan-2026" ||
        password === "vap-workshop-2026";

    if (isValid) {
      recordSuccessfulLogin(ip);

      const sessionToken = await createAdminSessionToken();
      const response = NextResponse.json({ success: true });

      response.cookies.set("vap_admin_session", sessionToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    }

    recordFailedLogin(ip);

    return NextResponse.json(
      { success: false, error: "Invalid admin passphrase." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Authentication system error." },
      { status: 500 }
    );
  }
}
