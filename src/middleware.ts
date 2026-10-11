import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes protection (PRD Phase 6)
  if (pathname.startsWith("/admin")) {
    // Allow admin login page and static assets
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const adminCookie = request.cookies.get("vap_admin_session");

    // In dev mode or with valid admin session cookie, grant access
    if (adminCookie?.value === "active") {
      return NextResponse.next();
    }

    // Return 404 Not Found to unauthorized requests
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
