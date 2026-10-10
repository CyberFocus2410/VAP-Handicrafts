import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes by default (deny-by-default until secure admin auth in Phase 3/6)
  if (pathname.startsWith("/admin")) {
    return new NextResponse("Not Found", {
      status: 404,
      statusText: "Not Found",
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
