import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export async function POST(request: Request) {
  try {
    // Auth guard
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: "File too large (max 20 MB)" }, { status: 413 });
    }

    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp", 
      "video/mp4", "video/webm", "video/quicktime", "application/octet-stream"
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.webm')) {
      return NextResponse.json({ success: false, error: `File type ${file.type} not allowed` }, { status: 415 });
    }

    // FALLBACK LOGIC: Use local filesystem if no token is found (Local Dev Only)
    // In Production (Vercel), BLOB_READ_WRITE_TOKEN must be set.
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ 
          success: false, 
          error: "Vercel Blob storage not configured. Please link a Blob store in your Vercel dashboard." 
        }, { status: 500 });
      }

      // Local development fallback
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      
      const ext = file.name.split(".").pop() || "bin";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      
      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
        message: "File uploaded locally (Dev Mode)",
      });
    }

    // PRODUCTION: Upload to Vercel Blob
    const blob = await put(file.name || "upload", file, {
      access: "public",
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      message: "File uploaded successfully to Vercel Blob",
    });
  } catch (error) {
    console.error("Upload error details:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Upload failed" 
    }, { status: 500 });
  }
}
