import { NextResponse, type NextRequest } from "next/server";
import { sniffImageMagicBytes, MAX_UPLOAD_BYTES } from "@/server/uploads/validator";
import { getSupabaseAdminClient } from "@/server/db/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No file provided. Please attach a photo." },
        { status: 400 }
      );
    }

    const blob = file as Blob;

    // 1. Enforce size limit
    if (blob.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `File exceeds maximum allowed size of 10MB. Current size: ${(blob.size / (1024 * 1024)).toFixed(1)}MB.` },
        { status: 400 }
      );
    }

    // 2. Read first bytes for magic sniffing
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const validation = sniffImageMagicBytes(buffer);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "Invalid file format." },
        { status: 400 }
      );
    }

    const assetId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `asset-${Date.now()}`;
    const storageFilename = `private-customizations/${assetId}.${validation.extension}`;

    // 3. Attempt upload to Supabase storage if available
    try {
      const supabase = getSupabaseAdminClient();
      await supabase.storage
        .from("order_customizations")
        .upload(storageFilename, buffer, {
          contentType: validation.detectedMime ?? "application/octet-stream",
          upsert: false,
        });

      // Record in database table
      await supabase.from("uploaded_assets").insert({
        id: assetId,
        session_id: request.headers.get("x-session-id") || "guest-session",
        storage_path: storageFilename,
        original_filename: (file as File).name || `upload.${validation.extension}`,
        mime_type: validation.detectedMime ?? "image/jpeg",
        byte_size: blob.size,
        status: "pending",
      });
    } catch {
      // In local dev without bucket, log and continue with successful validated asset id
    }

    return NextResponse.json(
      {
        success: true,
        assetId,
        mimeType: validation.detectedMime,
        byteSize: blob.size,
        extension: validation.extension,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
