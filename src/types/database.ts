/**
 * Database schema types based on Supabase tables.
 */

export interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  brand_id: string;
  category_slug: string;
  name: string;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  image_url: string | null;
  specs: Record<string, any> | null;
  rating: number | null;
  reviews_count: number;
  promotion_text: string | null;
  description: string | null;
  has_installment_0: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  brands?: Brand;
  categories?: Category;
  product_images?: ProductImage[];
}

export type ProductWithDetails = Product & {
  brands: Brand;
  categories: Category;
};

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  bg_color: string;
  target_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}
