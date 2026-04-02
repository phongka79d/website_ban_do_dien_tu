import { z } from "zod";

/**
 * Search Query Schema - Dùng để validate query parameters cho Search API
 */
export const searchQuerySchema = z.object({
  q: z.string().min(2, "Từ khóa tìm kiếm phải có ít nhất 2 ký tự"),
  limit: z.coerce.number().min(1).max(20).default(10),
  type: z.enum(["all", "product", "category", "brand"]).default("all"),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

/**
 * Interface cho kết quả tìm kiếm tổng hợp
 */
export interface UnifiedSearchResult {
  products: any[];
  categories: any[];
  brands: any[];
  total: number;
}
