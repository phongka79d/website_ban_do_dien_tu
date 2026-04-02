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
  "Password should be at least": "Mật khẩu quá yếu! Yêu cầu tối thiểu 8 ký tự, bao gồm chữ cái in hoa, chữ thường, số và ký tự đặc biệt.",
  "For security purposes, you can only request this after": "Vui lòng đợi 60 giây trước khi yêu cầu gửi lại mã OTP khác",
  "email rate limit exceeded": "Hệ thống tạm thời hết hạn mức gửi Email (Quá tải). Vui lòng thử lại sau khoảng 1h nữa.",
  "Error sending recovery email": "Máy chủ không thể gửi Email OTP. Lỗi cấu hình Máy chủ hoặc Tên người gửi.",
  "New password should be different from the old password": "Mật khẩu mới phải khác với mật khẩu cũ.",
  "Database error saving new user": "Đã có lỗi xảy ra khi thêm người dùng mới",

  // Custom Application Errors
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
export function getAuthMessage(error: any): string {
  if (!error) return AUTH_MESSAGES["unknown-error"];

  // Chống crash nếu error là object, bóc tách message chuỗi
  const errorMessage = typeof error === 'string' ? error : (error.message || JSON.stringify(error));

  console.log("Auth Error Debug:", errorMessage);

  if (errorMessage === "{}") return AUTH_MESSAGES["unknown-error"];

  const lowerError = errorMessage.toLowerCase();

  for (const key in AUTH_MESSAGES) {
    if (lowerError.includes(key.toLowerCase())) {
      return AUTH_MESSAGES[key];
    }
  }

  return errorMessage || AUTH_MESSAGES["unknown-error"];
}
