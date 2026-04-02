"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getAuthMessage } from "@/utils/auth-messages";
import { deleteFromCloudinary } from "@/utils/cloudinary-server";

export async function updateProfileInfo(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Lỗi kết nối Server" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Phiên đăng nhập đã hết hạn" };

  const full_name = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const avatar_url = formData.get("avatarUrl") as string;

  // 1. Validation (Bảo vệ Cookie và Header)
  if (full_name && full_name.length > 100) return { error: "Họ tên quá dài (tối đa 100 ký tự)" };
  if (phone && phone.length > 20) return { error: "Số điện thoại quá dài (tối đa 20 ký tự)" };
  if (avatar_url && avatar_url.length > 1024) return { error: "Đường dẫn ảnh quá dài (tối đa 1024 ký tự)" };

  // 2. AUTO-CLEANUP: Xóa ảnh cũ trên Cloudinary nếu người dùng đổi ảnh mới
  try {
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (currentProfile?.avatar_url && currentProfile.avatar_url !== avatar_url) {
      console.log("Cleanup trigger: Checking old avatar...", currentProfile.avatar_url);
      // Gọi hàm xóa (Hàm này giờ đã tự biết bóc tách ID từ URL)
      await deleteFromCloudinary(currentProfile.avatar_url);
    }
  } catch (err) {
    console.error("Cleanup failed but proceeding with update:", err);
  }

  // 3. Cập nhật vào Auth
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name, phone, avatar_url }
  });

  if (authError) return { error: getAuthMessage(authError.message) };

  // 4. Chắp vá đồng bộ sang Public Profiles (Giữ tính nhất quán DB)
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
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // 1. Kiểm tra nhập liệu đầy đủ
  if (!oldPassword || !newPassword || !confirmPassword) {
    return { error: "Vui lòng nhập đầy đủ các ô!" };
  }

  // 2. Kiểm tra mật khẩu nhập k đủ ký tự
  if (newPassword.length < 6) return { error: "MẬT KHẨU NHẬP K ĐỦ!" };

  // 3. Kiểm tra tính hợp lệ (Chữ hoa & Đặc biệt)
  if (!/[A-Z]/.test(newPassword)) return { error: "Mật khẩu cần ít nhất 1 chữ hoa!" };
  if (!/[^A-Za-z0-9]/.test(newPassword)) return { error: "Mật khẩu cần ít nhất 1 kí đặc biệt!" };

  // 4. Kiểm tra mật khẩu không trùng
  if (newPassword !== confirmPassword) return { error: "Mật khẩu mới không trùng khớp!" };

  // 5. Phép thử mật khẩu cũ
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPassword,
  });

  if (signInError) return { error: "Mật khẩu cũ không chính xác!" };

  // 6. Bắn tín hiệu OTP
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email);
  if (resetError) return { error: getAuthMessage(resetError.message) };

  return { success: "Đã gửi mã OTP về Email!" };
}

export async function verifyOtpAndChangePassword(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Lỗi kết nối Server" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return { error: "Không tìm thấy phiên hệ thống." };

  const otp = formData.get("otp") as string;
  const newPassword = formData.get("newPassword") as string;

  // Re-validation
  if (newPassword.length < 6) return { error: "MẬT KHẨU NHẬP K ĐỦ!" };

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

  return { success: "đổi mật khẩu thành công" };
}
