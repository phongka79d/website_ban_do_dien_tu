/**
 * UTILITY: Centralized Product Sorting Logic
 * Maps URL filter slugs to ProductService sortBy types.
 */

export type SortBy = "default" | "hot" | "discount" | "price_asc" | "price_desc";

export const SORT_OPTIONS = [
  { name: "Tất cả", value: "all" },
  { name: "Đang hot", value: "hot" },
  { name: "Giá tốt", value: "discount" },
  { name: "Giá thấp đến cao", value: "price_asc" },
  { name: "Giá cao đến thấp", value: "price_desc" },
];

/**
 * Maps a URL filter string to a valid SortBy type.
 */
export function getSortByFromParam(filterParam?: string): SortBy {
  if (!filterParam) return "default";

  const slug = filterParam.toLowerCase();

  switch (slug) {
    case "hot": return "hot";
    case "discount": return "discount";
    case "price_asc": return "price_asc";
    case "price_desc": return "price_desc";
    default: return "default";
  }
}
