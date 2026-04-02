import { v2 as cloudinary } from 'cloudinary';

// Cấu hình Cloudinary Admin SDK (Chỉ chạy phía Server)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Bóc tách Public ID từ một URL Cloudinary hoàn chỉnh.
 * Định dạng: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[PublicID].[ext]
 */
function extractPublicId(url: string): string | null {
  if (!url.includes("res.cloudinary.com")) return null;

  try {
    // Regex lấy phần sau /upload/v[digits]/ và bỏ phần mở rộng .jpg/png/...
    const regex = /\/v\d+\/(.+?)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

/**
 * Xóa một ảnh khỏi Cloudinary dựa trên Public ID hoặc URL hoàn chỉnh.
 */
export async function deleteFromCloudinary(idOrUrl: string) {
  if (!idOrUrl) return { result: "no_id_provided" };

  // 1. Xác định Public ID thực tế
  let publicId: string | null = idOrUrl;
  
  if (idOrUrl.startsWith("http")) {
    publicId = extractPublicId(idOrUrl);
  }

  // 2. Nếu không phải ảnh Cloudinary (ví dụ: link Google) -> Bỏ qua
  if (!publicId) {
    return { result: "not_a_cloudinary_asset" };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary Cleanup Result:", result);
    return result;
  } catch (error) {
    console.error("Cloudinary Deletion Error:", error);
    throw error;
  }
}
