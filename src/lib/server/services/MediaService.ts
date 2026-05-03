export interface MediaMetadata {
  url: string;
  type: "IMAGE" | "VIDEO";
  sizeBytes: number;
  mimeType: string;
}

export class MediaService {
  private static MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private static MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

  /**
   * Validates media upload before processing
   */
  public static async validateUpload(file: File): Promise<boolean> {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      throw new Error("Unsupported media type. Use images or videos.");
    }

    if (isImage && file.size > this.MAX_IMAGE_SIZE) {
      throw new Error("Image too large. Max 5MB.");
    }

    if (isVideo && file.size > this.MAX_VIDEO_SIZE) {
      throw new Error("Video too large. Max 50MB.");
    }

    return true;
  }

  /**
   * Orchestrates the upload to CDN (Vercel Blob / Cloudinary)
   * Note: This is a placeholder for the actual upload logic
   */
  public static async uploadToCDN(file: File): Promise<MediaMetadata> {
    // In a real system, you'd call put() from @vercel/blob or cloudinary.uploader.upload()
    // For now, returning a simulated response
    return {
      url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      type: file.type.startsWith("image/") ? "IMAGE" : "VIDEO",
      sizeBytes: file.size,
      mimeType: file.type
    };
  }
}
