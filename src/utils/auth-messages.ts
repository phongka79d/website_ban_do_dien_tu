/**
 * Dictionary of Auth Error Messages in Vietnamese
 */
const AUTH_MESSAGES: Record<string, string> = {
  // Supabase Default Errors
  "Invalid login credentials": "Email hoặc mật khẩu không chính xác.",
  "User already registered": "Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.",
  "Signup confirmed": "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.",
  "Email not confirmed": "Vui lòng xác nhận email trước khi đăng nhập.",
  "OTP expired": "Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới.",
  "Invalid OTP": "Mã xác thực không chính xác. Vui lòng thử lại.",
  "Too many requests": "Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.",
  "Password should contain at least one character": "Mật khẩu phải bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt.",
  
  // Custom Application Errors
  "phone-not-found": "Không tìm thấy tài khoản với số điện thoại này.",
  "account-blocked": "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ bộ phận CSKH.",
  "email-in-use": "Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.",
  "conn-failed": "Kết nối tới hệ thống thất bại. Vui lòng kiểm tra lại mạng.",
  "unknown-error": "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
};

/**
 * Translates an auth error message or code to Vietnamese.
 * @param error Error message or custom code
 * @returns Translated message
 */
export function getAuthMessage(error: string | undefined): string {
  if (!error) return AUTH_MESSAGES["unknown-error"];
  
  // Try to find direct match or partial match for common Supabase errors
  for (const key in AUTH_MESSAGES) {
    if (error.includes(key)) {
      return AUTH_MESSAGES[key];
    }
  }
  
  return error || AUTH_MESSAGES["unknown-error"];
}
