import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/server/admin/auth";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("vap_admin_session")?.value;
  const isAuthed = await verifyAdminSessionToken(sessionCookie);

  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const manifest = {
    name: "VAP Handicrafts Artisan CRM",
    short_name: "VAP CRM",
    description: "Artisan Command Center & Mobile CRM for VAP Handicrafts.",
    start_url: "/admin",
    display: "standalone",
    background_color: "#FAF5EF",
    theme_color: "#2D1A16",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}
