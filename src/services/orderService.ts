import { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import { Order, OrderWithItems, CartItem } from "@/types/database";

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
  ): Promise<{ data: Order | null; error: Error | PostgrestError | null }> {
    const { userId, items, totalAmount, shippingAddress, phoneNumber, paymentMethod } = params;
    try {
      // Server-side validation
      if (!shippingAddress || shippingAddress.length < 12) {
        throw new Error("Vui lòng nhập địa chỉ giao hàng rõ ràng (ít nhất 12 ký tự)");
      }
      if (shippingAddress.length > 300) {
        throw new Error("Địa chỉ không được quá 300 ký tự.");
      }
      if (!phoneNumber || !/^0\d{8,10}$/.test(phoneNumber)) {
        throw new Error("Số điện thoại không hợp lệ (Phải từ 9-11 chữ số)");
      }

      // Gọi hàm RPC để thực hiện toàn bộ quy trình đặt hàng trong một Transaction duy nhất
      const { data, error: rpcError } = await supabase.rpc("create_order_v1", {
        p_user_id: userId,
        p_total_amount: totalAmount,
        p_shipping_address: shippingAddress,
        p_phone_number: phoneNumber,
        p_payment_method: paymentMethod,
        p_items: items.map((item: CartItem) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: item.products?.price || 0,
        })),
      });

      if (rpcError) throw rpcError;

      if (!data.success) {
        throw new Error(data.error || "Đặt hàng thất bại từ hệ thống Database.");
      }

      // Lấy thông tin đơn hàng vừa tạo để trả về UI (nếu cần)
      const { data: order, error: fetchError } = await supabase
        .from("orders")
        .select()
        .eq("id", data.order_id)
        .single();

      if (fetchError) {
        console.warn("Order created in DB but failed to fetch for response:", fetchError.message);
      }

      return { data: order as Order, error: null };
    } catch (error: unknown) {
      console.error("Order creation failed (Atomic RPC):", (error as Error).message || error);
      return { data: null, error: error as Error };
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

    const resultData = data as OrderWithItems;
    
    if (resultData && resultData.user_id) {
       const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', resultData.user_id).single();
       if (profile) {
         resultData.profiles = profile;
       }
    }

    return resultData;
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

      const resultData = data as OrderWithItems;
      if (resultData && resultData.user_id) {
         const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', resultData.user_id).single();
         if (profile) {
           resultData.profiles = profile;
         }
      }
      return { data: resultData, error: null };
    } catch (error: unknown) {
      console.error("Error in fetchOrderByPublicInfo:", (error as Error).message);
      return { data: null, error: (error as Error).message };
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
    } catch (error: unknown) {
      console.error("Error in cancelOrder:", (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  }

  static async updateOrderStatus(
    supabase: SupabaseClient,
    orderId: string,
    status: string
  ): Promise<{ success: boolean; error: Error | PostgrestError | null }> {
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
    } catch (error: unknown) {
      console.error("Error updating order status:", (error as Error).message || error);
      return { success: false, error: error as Error };
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

    let resultData = (data as OrderWithItems[]) || [];
    if (resultData.length > 0) {
      const userIds = [...new Set(resultData.map(order => order.user_id).filter(id => id))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
        if (profilesData) {
          const profileMap = profilesData.reduce((acc, p) => {
            acc[p.id] = { full_name: p.full_name };
            return acc;
          }, {} as Record<string, { full_name: string | null }>);
          
          resultData = resultData.map(order => ({
            ...order,
            profiles: profileMap[order.user_id] || null
          }));
        }
      }
    }

    return resultData;
  }

  /**
   * Tìm kiếm đơn hàng với Phân trang (Dành cho Admin)
   */
  static async searchOrders(
    supabase: SupabaseClient,
    query: string,
    filter: string = "all",
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
      const cleanQuery = query.trim();
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanQuery);

      if (filter === "id") {
        if (isUUID) {
          baseQuery = baseQuery.eq("id", cleanQuery);
        } else {
          baseQuery = baseQuery.eq("id", "00000000-0000-0000-0000-000000000000");
        }
      } else if (filter === "phone") {
        baseQuery = baseQuery.ilike("phone_number", `%${cleanQuery}%`);
      } else if (filter === "address") {
        baseQuery = baseQuery.ilike("shipping_address", `%${cleanQuery}%`);
      } else if (filter === "name") {
        const { data: profiles } = await supabase.from("profiles").select("id").ilike("full_name", `%${cleanQuery}%`);
        if (profiles && profiles.length > 0) {
          baseQuery = baseQuery.in("user_id", profiles.map((p) => p.id));
        } else {
          baseQuery = baseQuery.eq("id", "00000000-0000-0000-0000-000000000000");
        }
      } else {
        if (isUUID) {
          baseQuery = baseQuery.eq("id", cleanQuery);
        } else {
          const { data: profiles } = await supabase.from("profiles").select("id").ilike("full_name", `%${cleanQuery}%`);
          let orClause = `phone_number.ilike.%${cleanQuery}%,shipping_address.ilike.%${cleanQuery}%`;
          if (profiles && profiles.length > 0) {
            orClause += `,user_id.in.(${profiles.map((p) => p.id).join(",")})`;
          }
          baseQuery = baseQuery.or(orClause);
        }
      }
    }

    const { data: rawData, error, count } = await baseQuery
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Supabase Error [searchOrders]:", error.message);
      return { data: [], count: 0 };
    }
    
    let resultData = (rawData as OrderWithItems[]) || [];
    
    // Gán dữ liệu profiles ở Application-layer vì Auth.users bị giới hạn Join không có khóa ngoại
    if (resultData.length > 0) {
      const userIds = [...new Set(resultData.map(order => order.user_id).filter(id => id))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
        if (profilesData) {
          const profileMap = profilesData.reduce((acc, p) => {
            acc[p.id] = { full_name: p.full_name };
            return acc;
          }, {} as Record<string, { full_name: string | null }>);
          
          resultData = resultData.map(order => ({
            ...order,
            profiles: profileMap[order.user_id] || null
          }));
        }
      }
    }

    return {
      data: resultData,
      count: count || 0
    };
  }
}
