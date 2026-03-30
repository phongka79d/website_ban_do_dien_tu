/**
 * Database schema types based on Supabase tables.
 */

export interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
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
  is_active: boolean;
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

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  products?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  
  // Joined fields
  products?: Product;
}

export type WishlistWithItems = WishlistItem[];

export type CartWithItems = Cart & {
  cart_items: CartItem[];
};

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: string;
  phone_number: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
  
  // Joined fields
  products?: Product;
}

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};
