import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/server/db/supabase";
import { sniffImageMagicBytes, MAX_UPLOAD_BYTES } from "@/server/uploads/validator";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Direct File Upload via FormData
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!file || typeof file === "string") {
        return NextResponse.json(
          { success: false, error: "No image file provided." },
          { status: 400 }
        );
      }

      const blob = file as Blob;
      if (blob.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: `Image exceeds maximum allowed size of 10MB. Current size: ${(blob.size / (1024 * 1024)).toFixed(1)}MB.`,
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const validation = sniffImageMagicBytes(new Uint8Array(arrayBuffer));
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, error: validation.error || "Unsupported image format." },
          { status: 400 }
        );
      }

      const ext = validation.extension || "webp";
      const filename = `products/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      // A. Primary: Upload to Supabase public storage bucket
      try {
        const supabase = getSupabaseAdminClient();
        const { error: uploadError } = await supabase.storage
          .from("product-media")
          .upload(filename, buffer, {
            contentType: validation.detectedMime ?? "image/jpeg",
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("product-media")
            .getPublicUrl(filename);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: publicUrlData.publicUrl,
              filename,
            });
          }
        }
      } catch (sbErr) {
        console.warn("Supabase storage upload failed, attempting local fallback:", sbErr);
      }

      // B. Local fallback: Save to public/images/products
      try {
        const localDir = path.join(process.cwd(), "public", "images", "products");
        if (!fs.existsSync(localDir)) {
          fs.mkdirSync(localDir, { recursive: true });
        }
        const localFilename = `uploaded-${Date.now()}.${ext}`;
        const localPath = path.join(localDir, localFilename);
        fs.writeFileSync(localPath, buffer);

        return NextResponse.json({
          success: true,
          url: `/images/products/${localFilename}`,
        });
      } catch (localErr) {
        console.error("Local file write failed:", localErr);
      }

      return NextResponse.json(
        { success: false, error: "Failed to persist uploaded image." },
        { status: 500 }
      );
    }

    // 2. Resolve External Image URL (e.g. imgbb viewer links)
    const body = await req.json();
    const rawUrl = (body.url || "").trim();

    if (!rawUrl) {
      return NextResponse.json(
        { success: false, error: "No URL provided to resolve." },
        { status: 400 }
      );
    }

    let directImageUrl = rawUrl;

    // Detect imgbb webpage viewer links like https://ibb.co/xyz or https://imgbb.com/xyz
    if (
      (rawUrl.includes("ibb.co/") || rawUrl.includes("imgbb.com/")) &&
      !rawUrl.includes("i.ibb.co/")
    ) {
      try {
        const pageRes = await fetch(rawUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        const html = await pageRes.text();
        const ogMatch =
          html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i) ||
          html.match(/<meta\s+name=["']twitter:image["']\s+content=["'](.*?)["']/i) ||
          html.match(/<link\s+rel=["']image_src["']\s+href=["'](.*?)["']/i);

        if (ogMatch && ogMatch[1]) {
          directImageUrl = ogMatch[1];
        }
      } catch (err) {
        console.warn("Failed to scrape imgbb page og:image:", err);
      }
    }

    // Download and import into Supabase product-media bucket for permanent high-speed hosting
    try {
      const imgRes = await fetch(directImageUrl);
      if (imgRes.ok) {
        const mime = imgRes.headers.get("content-type") || "image/jpeg";
        const ab = await imgRes.arrayBuffer();
        const buffer = Buffer.from(ab);
        const validation = sniffImageMagicBytes(new Uint8Array(ab));
        const ext = validation.isValid ? validation.extension : "jpg";

        const filename = `products/imported-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const supabase = getSupabaseAdminClient();
        const { error: uploadError } = await supabase.storage
          .from("product-media")
          .upload(filename, buffer, {
            contentType: mime,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("product-media")
            .getPublicUrl(filename);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: publicUrlData.publicUrl,
              originalUrl: rawUrl,
            });
          }
        }
      }
    } catch {
      // If download fails, return directImageUrl if it was resolved
    }

    return NextResponse.json({
      success: true,
      url: directImageUrl,
      originalUrl: rawUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process image upload";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
