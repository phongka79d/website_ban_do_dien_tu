"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthMessage } from "@/utils/auth-messages";

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase connection failed" };

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  // Check if email already exists using RPC (to bypass RLS for non-authenticated users)
  const { data: emailExists, error: rpcError } = await supabase
    .rpc("check_email_exists", { email_to_check: email });

  if (rpcError) {
    console.error("RPC Error checking email:", rpcError);
  }

  if (emailExists) {
    return { error: getAuthMessage("email-in-use") };
  }

    const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        role: "user",
        avatar_url: "", // Khởi tạo rỗng để tránh null
      },
    },
  });

  if (error) {
    return { error: getAuthMessage(error.message) };
  }

  // 3. Đồng bộ hóa thủ công sang bảng profiles ngay khi đăng ký thành công
  if (signUpData.user) {
    await supabase.from("profiles").upsert({
      id: signUpData.user.id,
      full_name: fullName,
      email,
      phone,
      avatar_url: "",
      role: "user",
      is_active: true,
      updated_at: new Date().toISOString(),
    });
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: getAuthMessage("conn-failed") };

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const signInResponse = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInResponse.error) {
    return { error: getAuthMessage(signInResponse.error.message) };
  }

  // 2. Kiểm tra Profile và thực hiện Tự phục hồi (Self-Healing)
  let data = signInResponse.data;
  
  // DEFENSIVE FIX: Nếu Supabase trả về chuỗi thay vì Object (do lỗi cookie/SSR)
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse signInResponse.data string:", e);
    }
  }

  const user = data?.user;
  const { data: profile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("is_active, role, avatar_url")
    .eq("id", user?.id)
    .single();

  // Xử lý lỗi Truy vấn (Trừ lỗi không tìm thấy bản ghi)
  if (profileFetchError && profileFetchError.code !== "PGRST116") {
    console.error("Profile fetch error:", profileFetchError);
  }

  // 3. Nếu thiếu Profile hoặc Profile tồn tại nhưng thiếu Avatar -> Tiến hành cập nhật/khôi phục
  if ((!profile || (profile && !profile.avatar_url)) && user) {
    console.log("Profile sync triggered for user:", user.id);
    
    // Lấy thông tin từ Metadata (đặc biệt là avatar_url từ Google/Facebook)
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Người dùng";
    const phone = user.user_metadata?.phone || "";
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || "";

    const { error: recoveryError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName,
        email: user.email,
        phone: phone,
        avatar_url: avatarUrl, // ĐỒNG BỘ ẢNH ĐẠI DIỆN
        role: profile?.role || "user", // Giữ nguyên role cũ nếu có
        is_active: profile?.is_active ?? true, // Giữ nguyên trạng thái cũ nếu có
        updated_at: new Date().toISOString()
      });

    if (recoveryError) {
      console.error("Profile sync failed:", recoveryError.message);
      // Không Sign Out ở đây nếu profile đã tồn tại (chỉ là lỗi sync avatar)
      if (!profile) {
        await supabase.auth.signOut();
        return { error: "Lỗi đồng bộ tài khoản. Vui lòng liên hệ hỗ trợ." };
      }
    }
    
    console.log("Profile successfully synced for user:", user.id);
  }

  // Kiểm tra Trạng thái Khóa tài khoản (Nếu profile tồn tại)
  if (profile && profile.is_active === false) {
    await supabase.auth.signOut();
    return { error: getAuthMessage("account-blocked") };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  if (!supabase) return;

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function verifyOtpCode(email: string, token: string) {
  const supabase = await createClient();
  if (!supabase) return { error: getAuthMessage("conn-failed") };

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    return { error: getAuthMessage(error.message) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function resendOtpCode(email: string) {
  const supabase = await createClient();
  if (!supabase) return { error: getAuthMessage("conn-failed") };

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    return { error: getAuthMessage(error.message) };
  }

  return { success: true };
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: getAuthMessage("conn-failed") };

  const email = formData.get("email") as string;
  if (!email) return { error: "Vui lòng nhập Email." };

  // Kiểm tra Email tồn tại (Optionally)
  const { data: emailExists } = await supabase.rpc("check_email_exists", { email_to_check: email });
  if (!emailExists) return { error: "Email này chưa được đăng ký trong hệ thống." };

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { error: getAuthMessage(error.message) };

  return { success: true };
}

export async function resetPasswordWithOtp(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: getAuthMessage("conn-failed") };

  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;
  const newPassword = formData.get("password") as string;

  if (!email || !otp || !newPassword) return { error: "Thiếu thông tin xác thực." };

  // 1. Xác thực OTP (Type: recovery)
  const { error: otpError } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "recovery",
  });

  if (otpError) return { error: "Mã OTP không hợp lệ hoặc đã hết hạn." };

  // 2. Cập nhật Mật khẩu mới
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    // SECURITY FIX: Nếu cập nhật pass lỗi, phải xóa Session đã tạo từ verifyOtp
    await supabase.auth.signOut();
    return { error: getAuthMessage(updateError.message) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function resendRecoveryOtp(email: string) {
  const supabase = await createClient();
  if (!supabase) return { error: getAuthMessage("conn-failed") };

  // Dùng resetPasswordForEmail để "gửi lại" mã Recovery
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) return { error: getAuthMessage(error.message) };
  return { success: true };
}
