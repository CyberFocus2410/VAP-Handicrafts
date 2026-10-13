import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSessionToken } from "@/server/admin/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin API routes protection
  if (pathname.startsWith("/api/admin")) {
    if (pathname === "/api/admin/login") {
      return NextResponse.next();
    }

    const adminCookie = request.cookies.get("vap_admin_session");
    const isValid = await verifyAdminSessionToken(adminCookie?.value);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin session required." },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Admin page routes protection (PRD Phase 6)
  if (pathname.startsWith("/admin")) {
    // Allow admin login page
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const adminCookie = request.cookies.get("vap_admin_session");

    // Cryptographically verify session token
    const isValid = await verifyAdminSessionToken(adminCookie?.value);
    if (isValid) {
      return NextResponse.next();
    }

    // Stealth Cloaking: Return 404 Not Found to unauthorized requests
    // so automated recon scanners cannot identify the presence of the admin portal
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
