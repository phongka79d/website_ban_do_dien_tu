import { SupabaseClient } from "@supabase/supabase-js";
import { WishlistItem, Product } from "@/types/database";

export class WishlistService {
  /**
   * Lấy danh sách yêu thích của người dùng
   */
  static async fetchWishlist(supabase: SupabaseClient, userId: string): Promise<WishlistItem[]> {
    const { data, error } = await supabase
      .from("wishlist_items")
      .select(`
        *,
        products (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wishlist items:", error.message);
      return [];
    }
    return data as WishlistItem[];
  }

  /**
   * Thêm sản phẩm vào danh sách yêu thích
   */
  static async addToWishlist(
    supabase: SupabaseClient,
    userId: string,
    productId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from("wishlist_items")
      .insert({
        user_id: userId,
        product_id: productId
      });

    if (error) {
      // Handle unique constraint (already in wishlist)
      if (error.code === '23505') return true; 
      console.error("Error adding to wishlist:", error.message);
      return false;
    }
    return true;
  }

  /**
   * Xóa sản phẩm khỏi danh sách yêu thích
   */
  static async removeFromWishlist(
    supabase: SupabaseClient,
    userId: string,
    productId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) {
      console.error("Error removing from wishlist:", error.message);
      return false;
    }
    return true;
  }

  /**
   * Kiểm tra sản phẩm có trong danh sách yêu thích không
   */
  static async isInWishlist(
    supabase: SupabaseClient,
    userId: string,
    productId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  }
}
