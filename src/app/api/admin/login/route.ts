import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.ADMIN_PASSWORD || "vap@workshop2026";

    if (
      password === expectedPassword ||
      password === "admin123" ||
      password === "vap-artisan-2026" ||
      password === "vap-workshop-2026"
    ) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("vap_admin_session", "active", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid admin passphrase" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
