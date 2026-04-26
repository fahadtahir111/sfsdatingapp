import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB (optional, but good to have)
const MAX_VIDEO_DURATION = 60; // 60 seconds

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

    // Determine if it's a video or image
    const isVideo = file.type.startsWith("video");
    const isImage = file.type.startsWith("image");

    if (!isVideo && !isImage) {
      return NextResponse.json({ success: false, error: "Only images and videos are allowed" }, { status: 415 });
    }

    // Size validation
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ success: false, error: "Image too large (max 20 MB)" }, { status: 413 });
    }
    
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ success: false, error: "Video file too large (max 100 MB)" }, { status: 413 });
    }

    // Convert file to buffer for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: isVideo ? "video" : "image",
          folder: "sfs_dating",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Post-upload validation for video duration
    if (isVideo && result.duration > MAX_VIDEO_DURATION) {
      // If video is too long, delete it from Cloudinary and return error
      await cloudinary.uploader.destroy(result.public_id, { resource_type: "video" });
      return NextResponse.json({ 
        success: false, 
        error: `Video too long (${Math.round(result.duration)}s). Max 1 minute allowed.` 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      message: "File uploaded successfully to Cloudinary",
    });
  } catch (error) {
    console.error("Upload error details:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Upload failed" 
    }, { status: 500 });
  }
}

