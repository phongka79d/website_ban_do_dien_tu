import { z } from "zod";
import { numericField, requiredString, trimString } from "./common";

/**
 * Product Validation Schema
 * Includes automatic sanitization (trimming, type conversion)
 */
export const productSchema = z.object({
  name: requiredString("Tên sản phẩm"),
  price: numericField("Giá bán"),
  original_price: numericField("Giá gốc").optional().nullable(),
  display_order: numericField("Thứ tự hiển thị", 0, true).optional().nullable(),
  stock_quantity: numericField("Số lượng tồn kho", 0, true),
  category_slug: requiredString("Danh mục"),
  brand_id: requiredString("Thương hiệu"),
  image_url: z.string().min(1, "Vui lòng tải lên hình ảnh sản phẩm"),
  promotion_text: trimString.optional().nullable(),
  description: trimString.optional().nullable(),
  has_installment_0: z.boolean(),
  specs: z.record(z.string(), z.any()),
}).refine((data) => {
  // Nếu có giá gốc, thì giá bán (price) không được lớn hơn giá gốc
  if (data.original_price && data.price > data.original_price) {
    return false;
  }
  return true;
}, {
  message: "Giá bán không được lớn hơn giá gốc.",
  path: ["price"], // Hiển thị lỗi tại ô nhập giá bán
});

// Infer types from the schema
export type ProductFormData = z.infer<typeof productSchema>;
