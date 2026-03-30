import { z } from "zod";
import { trimString } from "./common";

/**
 * Authentication Validation Schemas
 * Database handles complexity, we handle format and basic requirements.
 */

export const loginSchema = z.object({
  email: trimString
    .min(1, "Email không được để trống")
    .email("Email không đúng định dạng"),
  password: z.string().min(8, "Mật khẩu không được nhỏ hơn 8 ký tự"),
});

export const registerSchema = z.object({
  email: trimString
    .min(1, "Email không được để trống")
    .email("Email không đúng định dạng"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  full_name: trimString.min(2, "Họ và tên quá ngắn"),
  phone: trimString.regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
  confirm_password: z.string().min(1, "Vui lòng xác thực lại mật khẩu"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirm_password"],
});


export const forgotPasswordSchema = z.object({
  email: trimString
    .min(1, "Email không được để trống")
    .email("Email không đúng định dạng"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
