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
  password: z.string().min(6, "MẬT KHẨU NHẬP K ĐỦ"),
});

export const registerSchema = z.object({
  email: trimString
    .min(1, "Email không được để trống")
    .email("Email không đúng định dạng"),
  password: z.string()
    .min(6, "MẬT KHẨU NHẬP K ĐỦ")
    .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
    .regex(/[^A-Za-z0-9]/, "Cần ít nhất 1 kí đặc biệt"),
  full_name: trimString.min(2, "Họtên quá ngắn"),
  phone: trimString.regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
  confirm_password: z.string().min(1, "Vui lòng nhập đủ"),
}).refine((data) => data.password === data.confirm_password, {
  message: "không trùng",
  path: ["confirm_password"],
});


export const forgotPasswordSchema = z.object({
  email: trimString
    .min(1, "Email không được để trống")
    .email("Email không đúng định dạng"),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Vui lòng nhập đủ"),
  newPassword: z.string()
    .min(6, "Vui lòng nhập mật khẩu")
    .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
    .regex(/[^A-Za-z0-9]/, "Cần ít nhất 1 kí đặc biệt"),
  confirmPassword: z.string().min(1, "Vui lòng nhập đủ"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Chưa trùng mật khẩu",
  path: ["confirmPassword"],
}).refine((data) => data.newPassword !== data.oldPassword, {
  message: "Mật khẩu mới không được trùng với mật khẩu cũ",
  path: ["newPassword"],
});

export const resetPasswordSchema = z.object({
  email: trimString
    .min(1, "Email không được để trống")
    .email("Email không đúng định dạng"),
  otp: z.string().min(1, "Vui lòng nhập mã OTP"),
  password: z.string()
    .min(6, "MẬT KHẨU NHẬP K ĐỦ")
    .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
    .regex(/[^A-Za-z0-9]/, "Cần ít nhất 1 kí đặc biệt"),
  confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu nhập lại không khớp",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
