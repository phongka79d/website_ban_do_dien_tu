"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileInfo(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Lỗi kết nối Server" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Phiên đăng nhập đã hết hạn" };

  const full_name = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const avatar_url = formData.get("avatarUrl") as string;

  // 1. Cập nhật vào Auth
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name, phone, avatar_url }
  });

  if (authError) return { error: authError.message };

  // 2. Chắp vá đồng bộ sang Public Profiles (Giữ tính nhất quán DB)
  // Phòng hờ trigger on_update không có.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name,
      phone,
      avatar_url: avatar_url || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id);

  if (profileError) {
    console.error("Profile sync error:", profileError);
    // Vẫn trả về success vì Auth đã lưu thành công
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Lỗi kết nối Server" };
  const password = formData.get("newPassword") as string;
  
  if (password.length < 6) {
    return { error: "Mật khẩu phải từ 6 ký tự trở lên" };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };
  
  // Thành công Supabase sẽ ép văng token cũ
  return { success: true };
}

export async function requestPasswordResetOtp() {
  const supabase = await createClient();
  if (!supabase) return { error: "Lỗi kết nối Server" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Thiếu email" };

  const { error } = await supabase.auth.resetPasswordForEmail(user.email);
  if (error) return { error: error.message };

  return { success: true, message: "Đã gửi Email/OTP khôi phục mật khẩu. Vui lòng check hộp thư." };
}
