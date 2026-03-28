"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  ArrowLeft,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { 
  requestPasswordReset, 
  resetPasswordWithOtp,
  resendRecoveryOtp 
} from "@/app/auth/actions";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Bộ đếm ngược cho nút Gửi lại mã
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Tự động redirect sau 3s khi thành công
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => window.location.href = "/", 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Xử lý Bước 1: Yêu cầu mã OTP
  async function handleStep1(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const emailValue = formData.get("email") as string;
    setEmail(emailValue);

    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setStep(2);
        setCountdown(60); 
        setMessage("Mã xác thực đã được gửi đến Email của bạn.");
      }
    });
  }

  // Xử lý Bước 2: Xác thực & Đổi mật khẩu
  async function handleStep2(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const pass = formData.get("password") as string;
    const confirm = formData.get("confirmPassword") as string;

    if (pass !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordWithOtp(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setStep(3); 
      }
    });
  }

  // Xử lý Gửi lại mã OTP
  async function handleResendOtp() {
    if (countdown > 0 || resendLoading) return;
    
    setResendLoading(true);
    setError(null);
    setMessage(null);
    
    const result = await resendRecoveryOtp(email);
    if (result?.error) {
      setError(result.error);
    } else {
      setMessage("Mã xác thực mới đã được gửi!");
      setCountdown(60);
      setTimeout(() => setMessage(null), 5000);
    }
    setResendLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-slate-50 to-secondary/20 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-8 shadow-2xl backdrop-blur-xl md:p-10">
          
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-secondary/10 blur-2xl" />

          {step < 3 && (
            <Link 
              href="/login" 
              className="absolute left-6 top-6 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} /> Quay lại
            </Link>
          )}

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Mail size={32} />
                </div>
                <h1 className="text-2xl font-black text-slate-900">Quên mật khẩu?</h1>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Nhập email đăng ký để nhận mã khôi phục mật khẩu.
                </p>
              </div>

              <form onSubmit={handleStep1} className="space-y-5">
                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100 italic">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Email của bạn</label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="example@gmail.com"
                      className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-primary py-4 text-sm font-black text-white transition-all hover:bg-primary-dark hover:shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Gửi mã xác nhận
                      <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck size={32} />
                </div>
                <h1 className="text-2xl font-black text-slate-900">Thiết lập lại</h1>
                <p className="mt-2 text-sm font-medium text-slate-500 px-4 leading-relaxed">
                  Mã OTP đã được gửi đến <br />
                  <span className="font-bold text-slate-700">{email}</span>
                </p>
              </div>

              <form onSubmit={handleStep2} className="space-y-5">
                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100 italic">
                    {error}
                  </div>
                )}
                {message && !error && (
                  <div className="rounded-xl bg-green-50 p-4 text-xs font-medium text-green-600 border border-green-100 italic animate-pulse">
                    {message}
                  </div>
                )}

                <input type="hidden" name="email" value={email} />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Mã OTP 6 số</label>
                    <button 
                      type="button"
                      disabled={countdown > 0 || resendLoading}
                      onClick={handleResendOtp}
                      className="text-[10px] font-bold text-primary hover:underline disabled:text-slate-400 disabled:no-underline flex items-center gap-1"
                    >
                      {resendLoading ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                      {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại mã"}
                    </button>
                  </div>
                  <input
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="000000"
                    className="w-full tracking-[1em] text-center rounded-2xl border border-slate-200 bg-white/50 py-4 text-lg font-black outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3.5 pl-11 pr-11 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3.5 pl-11 pr-11 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending || otp.length < 6}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-secondary py-4 text-sm font-black text-white transition-all hover:bg-secondary-dark hover:shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>Cập nhật mật khẩu mới</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-primary hover:underline transition-all"
                >
                  Sai Email? Quay lại nhập lại
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="text-center animate-in zoom-in-95 duration-700">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 animate-bounce">
                <CheckCircle2 size={40} />
              </div>
              <h1 className="text-2xl font-black text-slate-900">Thành công!</h1>
              <p className="mt-4 text-sm font-medium text-slate-500 leading-relaxed px-2">
                Mật khẩu của bạn đã được khôi phục. <br />
                Đang chuyển hướng về trang chủ...
              </p>
              
              <div className="mt-8">
                <Link 
                  href="/"
                  className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-3.5 text-sm font-black text-white transition-all hover:bg-primary-dark active:scale-95"
                >
                  Vào Trang Chủ Ngay
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
