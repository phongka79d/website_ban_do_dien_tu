import { NextRequest, NextResponse } from "next/server";
import { verifyOldPasswordAndSendOtp, verifyOtpAndChangePassword } from "@/app/auth/profile-actions";
import { createClient } from "@/utils/supabase/server";

/**
 * API Route for Postman Testing: /api/auth/change-password
 * Method: POST
 * Body: { 
 * oldPassword, 
 * newPassword, 
 * confirmPassword
 * }
 * 
 * {
 * newPassword,
 * otp
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Lỗi kết nối Server" }, { status: 500 });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      console.log("Action Failed: No User found in Session.");
      return NextResponse.json({ error: "Không tìm thấy phiên hệ thống." }, { status: 401 });
    }

    console.log("Action Triggered for User:", user.email);

    const body = await req.json();
    console.log("API Change Password - Request Body:", body);
    const { oldPassword, newPassword, confirmPassword, otp } = body;

    const formData = new FormData();
    if (oldPassword) formData.append("oldPassword", oldPassword);
    if (newPassword) formData.append("newPassword", newPassword);
    if (confirmPassword) formData.append("confirmPassword", confirmPassword);
    if (otp) formData.append("otp", otp);

    // Step 2: If OTP is provided, finish the process
    if (otp) {
      const result = await verifyOtpAndChangePassword(formData);
      return NextResponse.json(result);
    }

    // Step 1: Verify old and send OTP
    const result = await verifyOldPasswordAndSendOtp(formData);
    console.log("verifyOldPasswordAndSendOtp Result:", result);
    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json({ error: "Tham số không hợp lệ!" }, { status: 400 });
  }
}
