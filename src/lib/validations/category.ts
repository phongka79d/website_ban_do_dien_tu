import { z } from "zod";
import { requiredString, slugSchema, trimString } from "./common";

/**
 * Category Validation Schema
 */
export const categorySchema = z.object({
  name: requiredString("Tên danh mục"),
  slug: slugSchema,
  description: trimString.optional().nullable(),
  image_url: trimString.optional().nullable(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
