import { createClient } from "@/utils/supabase/server";
import { getAuthMessage } from "@/utils/auth-messages";
import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validations/auth";

/**
 * API Route: Reset Password (Verify OTP and Update Password)
 * Method: POST
 * Body: { email: string, otp: string, password: string }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: getAuthMessage("conn-failed") },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { email, otp, password } = validation.data;

    // 1. Xác thực mã OTP (recovery type)
    // Sau khi verify thành công, Supabase sẽ tạo một session cho User
    const { error: otpError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "recovery",
    });

    if (otpError) {
      return NextResponse.json(
        { error: "Mã OTP không hợp lệ hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    // 2. Cập nhật mật khẩu mới cho User đang có session
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      // Nếu đổi pass lỗi, phải Sign Out để xóa session tạm từ verifyOtp
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: getAuthMessage(updateError.message) },
        { status: 400 }
      );
    }

    // Đăng xuất sau khi đổi mật khẩu để bắt đăng nhập lại (tùy chọn bảo mật)
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập lại.",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("API Error [reset-password]:", errorMessage);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
