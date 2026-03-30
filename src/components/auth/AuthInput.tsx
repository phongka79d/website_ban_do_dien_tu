"use client";

import React from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Nhãn hiển thị phía trên input */
  label: string;
  /** Icon bên trái (JSX element) */
  icon?: React.ReactNode;
  /** Slot bên phải — dùng cho nút show/hide password */
  rightSlot?: React.ReactNode;
  /** Slot bên phải của label — dùng cho link "Quên mật khẩu?" */
  labelSlot?: React.ReactNode;
  /** Màu focus ring */
  accentColor?: "primary" | "secondary";
  /** Thông báo lỗi inline */
  error?: string;
}

/**
 * AuthInput — Input field chuẩn dùng trong các trang Auth.
 * Bao gồm: label, icon trái, slot phải (password toggle), error message.
 */
const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(({
  label,
  icon,
  rightSlot,
  labelSlot,
  accentColor = "primary",
  error,
  className,
  ...props
}, ref) => {
  const hasLeftIcon = Boolean(icon);
  const hasRightSlot = Boolean(rightSlot);

  const focusCls =
    accentColor === "primary"
      ? "focus:border-primary focus:ring-primary/10"
      : "focus:border-secondary focus:ring-secondary/10";

  const paddingLeft = hasLeftIcon ? "pl-11" : "pl-4";
  const paddingRight = hasRightSlot ? "pr-11" : "pr-4";

  return (
    <div className="space-y-1.5 w-full">
      {/* Label row */}
      {label && (
        <div className={`flex items-center ${labelSlot ? "justify-between" : ""} ml-1`}>
          <label className="text-xs font-black uppercase tracking-wider text-slate-500">
            {label}
          </label>
          {labelSlot && <span className="text-[10px]">{labelSlot}</span>}
        </div>
      )}

      {/* Input wrapper */}
      <div className="relative">
        <input
          {...props}
          ref={ref}
          className={`w-full rounded-2xl border border-slate-200 bg-white/50 py-3.5 text-sm outline-none transition-all focus:ring-4 ${paddingLeft} ${paddingRight} ${focusCls} ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""} ${className ?? ""}`}
        />
        {/* Left icon */}
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        {/* Right slot */}
        {rightSlot && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            {rightSlot}
          </span>
        )}
      </div>

      {/* Inline error */}
      {error && (
        <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
});

AuthInput.displayName = "AuthInput";

export default AuthInput;

