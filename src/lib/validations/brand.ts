import { z } from "zod";
import { requiredString, trimString } from "./common";

/**
 * Brand Validation Schema
 */
export const brandSchema = z.object({
  name: requiredString("Tên thương hiệu"),
  logo_url: trimString.optional().nullable(),
});

export type BrandFormData = z.infer<typeof brandSchema>;
