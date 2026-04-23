import { createClient } from "@/utils/supabase/server";
import { getAuthMessage } from "@/utils/auth-messages";
import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/auth";

/**
 * API Route: Forgot Password (Request Reset)
 * Method: POST
 * Body: { email: string }
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
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { email } = validation.data;

    // 1. Kiểm tra Email tồn tại qua RPC
    const { data: emailExists, error: rpcError } = await supabase.rpc("check_email_exists", {
      email_to_check: email,
    });

    if (rpcError) {
      console.error("RPC Error [forgot-password]:", rpcError);
    }

    if (!emailExists) {
      return NextResponse.json(
        { error: "Email nhập chưa chính xác" },
        { status: 404 }
      );
    }

    // 2. Gửi yêu cầu Reset Password (Supabase sẽ gửi email/OTP tùy cấu hình)
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return NextResponse.json(
        { error: getAuthMessage(error.message) },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Yêu cầu khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra email hoặc mã OTP của bạn.",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("API Error [forgot-password]:", errorMessage);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
