import { z } from "zod";
import { numericField, requiredString, trimString } from "./common";

/**
 * Banner Validation Schema
 */
export const bannerSchema = z.object({
  title: requiredString("Tiêu đề banner"),
  subtitle: trimString.optional().nullable(),
  image_url: z.string().min(1, "Vui lòng tải lên hình ảnh banner"),
  bg_color: z.string().optional(),
  target_url: trimString.optional().nullable(),
  is_active: z.boolean(),
  display_order: numericField("Thứ tự hiển thị", 0, true),

});

export type BannerFormData = z.infer<typeof bannerSchema>;
