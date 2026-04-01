import { SupabaseClient } from "@supabase/supabase-js";
import { Order, OrderItem, OrderWithItems, CartItem } from "@/types/database";

export class OrderService {
  /**
   * Tạo đơn hàng mới từ giỏ hàng
   */
  static async createOrder(
    supabase: SupabaseClient,
    params: {
      userId: string;
      items: CartItem[];
      totalAmount: number;
      shippingAddress: string;
      phoneNumber: string;
      paymentMethod: string;
    }
  ): Promise<{ data: Order | null; error: any }> {
    const { userId, items, totalAmount, shippingAddress, phoneNumber, paymentMethod } = params;

    try {
      // 1. Tạo bản ghi Order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          phone_number: phoneNumber,
          payment_method: paymentMethod,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Tạo các bản ghi Order Items (Lấy snapshot giá tại thời điểm mua)
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.products?.price || 0
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Cập nhật tồn kho (Stock Quantity) cho từng sản phẩm
      // Lưu ý: Trong thực tế nên dùng RPC để đảm bảo tính nguyên tử (Atomicity)
      // Ở đây chúng ta chạy tuần tự hoặc Promise.all cho đơn giản hóa logic TS
      const stockUpdates = items.map(item => {
        const currentStock = item.products?.stock_quantity || 0;
        return supabase
          .from("products")
          .update({ stock_quantity: Math.max(0, currentStock - item.quantity) })
          .eq("id", item.product_id);
      });

      await Promise.all(stockUpdates);

      // 4. Xóa các sản phẩm đã đặt khỏi giỏ hàng
      const { error: clearCartError } = await supabase
        .from("cart_items")
        .delete()
        .in("id", items.map(i => i.id));

      if (clearCartError) {
        console.warn("Order created but failed to clear cart items:", clearCartError.message);
      }

      return { data: order as Order, error: null };
    } catch (error: any) {
      console.error("Order creation failed:", error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Lấy danh sách đơn hàng của người dùng kèm theo items
   */
  static async fetchUserOrders(supabase: SupabaseClient, userId: string): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user orders:", error.message);
      return [];
    }

    return (data as OrderWithItems[]) || [];
  }

  /**
   * Lấy chi tiết một đơn hàng
   */
  static async getOrderDetails(supabase: SupabaseClient, orderId: string): Promise<OrderWithItems | null> {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching order details:", error.message);
      return null;
    }

    return data as OrderWithItems;
  }

  /**
   * Tra cứu đơn hàng công khai (Chỉ cần Mã đơn hàng)
   */
  static async fetchOrderByPublicInfo(
    supabase: SupabaseClient, 
    orderId: string
  ): Promise<{ data: OrderWithItems | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.code === '22P02') return { data: null, error: "Mã đơn hàng không hợp lệ hoặc không tồn tại." };
        throw error;
      }

      return { data: data as OrderWithItems, error: null };
    } catch (error: any) {
      console.error("Error in fetchOrderByPublicInfo:", error.message);
      return { data: null, error: error.message };
    }
  }

  /**
   * Hủy đơn hàng (Chỉ cho phép nếu trang thái là 'pending')
   */
  static async cancelOrder(
    supabase: SupabaseClient,
    orderId: string,
    userId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // 1. Kiểm tra đơn hàng có tồn tại và thuộc về User không, và có đang 'pending' không
      const { data: order, error: fetchError } = await supabase
        .from("orders")
        .select("status, user_id")
        .eq("id", orderId)
        .eq("user_id", userId)
        .single();

      if (fetchError || !order) return { success: false, error: "Đơn hàng không tồn tại hoặc bạn không có quyền hủy." };
      if (order.status !== 'pending') return { success: false, error: "Chỉ có thể hủy đơn hàng đang ở trạng thái 'Chờ xác nhận'." };

      // 2. Cập nhật trạng thái sang 'cancelled'
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: 'cancelled' })
        .eq("id", orderId);

      if (updateError) throw updateError;

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error in cancelOrder:", error.message);
      return { success: false, error: error.message };
    }
  }

  static async updateOrderStatus(
    supabase: SupabaseClient,
    orderId: string,
    status: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("Không có bản ghi nào được cập nhật. Có thể do RLS policy hoặc ID sai.");
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error updating order status:", error.message || error);
      return { success: false, error };
    }
  }

  /**
   * Lấy danh sách TOÀN BỘ đơn hàng (Dành cho Admin)
   */
  static async fetchAllOrders(supabase: SupabaseClient): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all orders:", error.message);
      return [];
    }

    return (data as OrderWithItems[]) || [];
  }

  /**
   * Tìm kiếm đơn hàng với Phân trang (Dành cho Admin)
   */
  static async searchOrders(
    supabase: SupabaseClient, 
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: OrderWithItems[]; count: number }> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let baseQuery = supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `, { count: "exact" });
    
    if (query) {
      // Tìm theo Tên, Số điện thoại hoặc Địa chỉ
      baseQuery = baseQuery.or(`full_name.ilike.%${query}%,phone_number.ilike.%${query}%,shipping_address.ilike.%${query}%`);
    }

    const { data, error, count } = await baseQuery
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Supabase Error [searchOrders]:", error.message);
      return { data: [], count: 0 };
    }

    return { 
      data: (data as OrderWithItems[]) || [], 
      count: count || 0 
    };
  }
}
