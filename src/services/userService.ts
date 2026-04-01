import { SupabaseClient } from "@supabase/supabase-js";
import { Profile } from "@/types/database";

export class UserService {
  /**
   * Lấy danh sách người dùng với phân trang và tìm kiếm
   */
  static async fetchUsers(
    supabase: SupabaseClient,
    page: number = 1,
    pageSize: number = 10,
    search: string = "",
    roleFilter: string = "all"
  ) {
    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" });

    // Search logic
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Role filter
    if (roleFilter !== "all") {
      query = query.eq("role", roleFilter);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching users:", error);
      return { data: [], count: 0 };
    }

    return { data: data as Profile[], count: count || 0 };
  }

  /**
   * Cập nhật trạng thái hoạt động (Khóa/Mở khóa)
   * CHẶN: Admin không thể khóa chính mình hoặc các Admin khác. 2.0
   */
  static async updateStatus(
    supabase: SupabaseClient,
    targetUserId: string,
    isActive: boolean,
    currentAdminId: string
  ) {
    // 1. Chống tự khóa chính mình
    if (targetUserId === currentAdminId) {
      return { error: "Bạn không thể tự khóa chính mình." };
    }

    // 2. Chống khóa Admin khác (Cần kiểm tra role của target)
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", targetUserId)
      .single();

    if (targetProfile?.role === "admin" && isActive === false) {
      return { error: "Không thể khóa tài khoản của quản trị viên khác." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", targetUserId);

    if (error) return { error: error.message };
    return { success: true };
  }

  /**
   * Thay đổi quyền hạn (Admin / User)
   */
  static async updateRole(
    supabase: SupabaseClient,
    targetUserId: string,
    newRole: "admin" | "user",
    currentAdminId: string
  ) {
    // Chống tự hạ quyền của chính mình (Để tránh mất quyền Admin vô ý)
    if (targetUserId === currentAdminId && newRole === "user") {
      return { error: "Bạn không thể tự hạ quyền của chính mình." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", targetUserId);

    if (error) return { error: error.message };
    return { success: true };
  }
}
