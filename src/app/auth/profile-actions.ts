"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getAuthMessage } from "@/utils/auth-messages";

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

  if (authError) return { error: getAuthMessage(authError.message) };

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

export async function verifyOldPasswordAndSendOtp(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Lỗi kết nối Server" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return { error: "Không tìm thấy phiên hệ thống." };

  const oldPassword = formData.get("oldPassword") as string;

  // 1. Phép thử mật khẩu cũ (Refresh Session luôn để pass qua rào cản 24h)
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPassword,
  });

  if (signInError) return { error: "Mật khẩu cũ không chính xác!" };

  // 2. Bắn tín hiệu OTP
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email);
  if (resetError) return { error: getAuthMessage(resetError.message) };

  return { success: true };
}

export async function verifyOtpAndChangePassword(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Lỗi kết nối Server" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return { error: "Không tìm thấy phiên hệ thống." };

  const otp = formData.get("otp") as string;
  const newPassword = formData.get("newPassword") as string;

  if (newPassword.length < 6) return { error: "Mật khẩu mới phải từ 6 ký tự trở lên." };

  // 1. Cổng Check Mã OTP 
  const { error: otpError } = await supabase.auth.verifyOtp({
    email: user.email,
    token: otp,
    type: "recovery",
  });

  if (otpError) return { error: "Mã OTP không hợp lệ hoặc đã hết hạn!" };

  // 2. Chốt hạ đổi Mật khẩu mới
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) return { error: getAuthMessage(updateError.message) };

  return { success: true };
}
