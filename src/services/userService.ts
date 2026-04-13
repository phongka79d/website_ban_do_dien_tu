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

    // 2. Chống khóa Admin khác (Kiểm tra mảng thay vì .single)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", targetUserId);

    const targetProfile = profiles && profiles.length > 0 ? profiles[0] : null;

    if (!targetProfile) {
      return { error: "Không tìm thấy thông tin người dùng mục tiêu." };
    }

    if (targetProfile?.role === "admin" && isActive === false) {
      return { error: "Không thể khóa tài khoản của quản trị viên khác." };
    }

    const { data: updatedRows, error } = await supabase
      .from("profiles")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", targetUserId)
      .select();

    if (error) return { error: error.message };
    if (!updatedRows || updatedRows.length === 0) {
      return { error: "Cập nhật trạng thái thất bại. Có thể bạn không có quyền (Lỗi RLS)." };
    }
    return { success: true };
  }

  /**
   * Thay đổi quyền hạn (Admin / User)
   */
  static async updateRole(
    supabase: SupabaseClient,
    targetUserId: string,
    newRole: "admin" | "staff" | "user",
    currentAdminId: string
  ) {
    // Chống tự hạ quyền của chính mình (Để tránh mất quyền Admin vô ý)
    if (targetUserId === currentAdminId && newRole !== "admin") {
      return { error: "Bạn không thể tự hạ quyền của chính mình." };
    }

    const { data: updatedRows, error } = await supabase
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", targetUserId)
      .select();

    if (error) return { error: error.message };
    if (!updatedRows || updatedRows.length === 0) {
      return { error: "Chuyển đổi vai trò thất bại. Kiểm tra lại quyền hạn của bạn (Lỗi RLS)." };
    }
    return { success: true };
  }
}
