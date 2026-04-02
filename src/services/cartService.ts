import { SupabaseClient } from "@supabase/supabase-js";
import { Cart, CartItem, Product } from "@/types/database";

export class CartService {
  /**
   * Lấy hoặc tạo giỏ hàng cho người dùng
   */
  static async getOrCreateCart(supabase: SupabaseClient, userId: string): Promise<string> {
    const { data, error } = await supabase
      .from("carts")
      .upsert({ user_id: userId }, { onConflict: "user_id" })
      .select("id");

    if (error || !data || data.length === 0) {
      console.error("Error getting/creating cart:", error?.message || "No data returned");
      throw new Error(error?.message || "Failed to get or create cart");
    }
    return data[0].id;
  }

  /**
   * Lấy toàn bộ sản phẩm trong giỏ hàng kèm thông tin sản phẩm
   */
  static async fetchCartItems(supabase: SupabaseClient, cartId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (*)
      `)
      .eq("cart_id", cartId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cart items:", error.message);
      return [];
    }
    return data as CartItem[];
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  static async addToCart(
    supabase: SupabaseClient, 
    cartId: string, 
    productId: string, 
    quantity: number = 1
  ): Promise<string | null> {
    // Kiểm tra xem đã có sản phẩm này chưa (Thay maybeSingle) 5.0
    const { data: existingData } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", productId);

    const existing = existingData && existingData.length > 0 ? existingData[0] : null;

    if (existing) {
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id)
        .select("id");
      
      if (error || !data || data.length === 0) return null;
      return data[0].id;
    }

    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        cart_id: cartId,
        product_id: productId,
        quantity
      })
      .select("id");

    if (error || !data || data.length === 0) return null;
    return data[0].id;
  }

  /**
   * Cập nhật số lượng sản phẩm
   */
  static async updateQuantity(supabase: SupabaseClient, itemId: string, quantity: number): Promise<boolean> {
    if (quantity <= 0) {
      const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
      return !error;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);
    return !error;
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  static async removeFromCart(supabase: SupabaseClient, itemId: string): Promise<boolean> {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
    return !error;
  }
}
