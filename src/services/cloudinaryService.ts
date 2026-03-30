import { v2 as cloudinary } from "cloudinary";

/**
 * Configure Cloudinary with server-side credentials.
 * These must be set in .env.local without NEXT_PUBLIC_ prefix.
 */
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CloudinaryService = {
  /**
   * Helper to check if a string is a Cloudinary Public ID or an external URL.
   * Based on the project convention: if it doesn't start with http or /, it's a public id.
   */
  isCloudinaryId(src: string): boolean {
    if (!src) return false;
    return !src.startsWith("http") && !src.startsWith("/");
  },

  /**
   * Deletes a single image from Cloudinary.
   */
  async deleteImage(publicId: string) {
    if (!this.isCloudinaryId(publicId)) return { result: "not_cloudinary" };
    
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error: any) {
      console.error("Cloudinary Error [deleteImage]:", error.message);
      return { error: error.message };
    }
  },

  /**
   * Deletes multiple images from Cloudinary.
   */
  async deleteImages(publicIds: string[]) {
    // Filter out nested IDs that are not Cloudinary
    const validIds = publicIds.filter(id => this.isCloudinaryId(id));
    if (validIds.length === 0) return { result: "no_valid_ids" };

    try {
      const result = await cloudinary.api.delete_resources(validIds);
      return result;
    } catch (error: any) {
      console.error("Cloudinary Error [deleteImages]:", error.message);
      return { error: error.message };
    }
  }
};
