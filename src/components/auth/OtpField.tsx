"use client";

import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface OtpFieldProps {
  /** Giá trị OTP hiện tại */
  value: string;
  /** Callback khi người dùng thay đổi giá trị */
  onChange: (value: string) => void;
  /**
   * Async function gọi API gửi lại mã.
   * Trả về dữ liệu thô — component không quan tâm kết quả,
   * việc hiển thị error/success để parent xử lý.
   */
  onResend?: () => Promise<void>;
  /** Giây đếm ngược ban đầu khi component mount (0 = nút bấm ngay) */
  initialCountdown?: number;
  /** Nhãn hiển thị phía trên input */
  label?: string;
  /** Màu accent cho focus ring */
  accentColor?: "primary" | "secondary";
}

/**
 * OtpField — Component nhập OTP 6 số dùng chung.
 * Tự quản lý: bộ đếm ngược, loading resend.
 * Parent quản lý: error/success message, giá trị OTP.
 */
export default function OtpField({
  value,
  onChange,
  onResend,
  initialCountdown = 0,
  label = "Mã OTP 6 số",
  accentColor = "primary",
}: OtpFieldProps) {
  const [countdown, setCountdown] = useState(initialCountdown);
  const [resendLoading, setResendLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Bộ đếm ngược tự động
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleResendClick() {
    if (!onResend || countdown > 0 || resendLoading) return;
    setResendLoading(true);
    setSuccessMsg(null);
    await onResend();
    setCountdown(initialCountdown || 60);
    setSuccessMsg("Mã mới đã được gửi!");
    setTimeout(() => setSuccessMsg(null), 5000);
    setResendLoading(false);
  }

  const focusCls =
    accentColor === "primary"
      ? "focus:border-primary focus:ring-primary/10"
      : "focus:border-secondary focus:ring-secondary/10";

  return (
    <div className="space-y-1.5">
      {/* Label + Resend button */}
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
          {label}
        </label>

        {onResend && (
          <button
            type="button"
            disabled={countdown > 0 || resendLoading}
            onClick={handleResendClick}
            className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline disabled:text-slate-400 disabled:no-underline transition-colors"
          >
            {resendLoading ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <RefreshCw size={10} />
            )}
            {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại mã"}
          </button>
        )}
      </div>

      {/* OTP Input */}
      <input
        type="text"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        placeholder="000000"
        autoComplete="one-time-code"
        inputMode="numeric"
        className={`w-full tracking-[1em] text-center rounded-2xl border border-slate-200 bg-white/50 py-4 text-lg font-black outline-none transition-all focus:ring-4 ${focusCls}`}
      />

      {/* Success message nội bộ */}
      {successMsg && (
        <p className="mt-1 text-center text-[10px] font-bold text-green-600 animate-pulse">
          {successMsg}
        </p>
      )}
    </div>
  );
}
