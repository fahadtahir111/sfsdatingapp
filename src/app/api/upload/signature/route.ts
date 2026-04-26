import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log("Signature Route: Unauthorized access attempt");
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Cloudinary env vars missing:", { 
        hasCloudName: !!cloudName, 
        hasApiKey: !!apiKey, 
        hasApiSecret: !!apiSecret 
      });
      return NextResponse.json({ 
        success: false, 
        error: "Server configuration error: Cloudinary environment variables are missing." 
      }, { status: 500 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "sfs_dating";
    
    // Generate signature using API secret
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      apiSecret
    );

    return NextResponse.json({
      success: true,
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error) {
    console.error("Signature error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate signature" 
    }, { status: 500 });
  }
}
