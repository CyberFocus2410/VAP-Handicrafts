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
    const isDev = process.env.NODE_ENV === "development";

    // In dev mode or with valid admin session cookie, grant access
    if (adminCookie?.value === "active" || isDev) {
      return NextResponse.next();
    }

    // Otherwise redirect to admin login
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
