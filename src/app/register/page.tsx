"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signUp, verifyOtpCode, resendOtpCode } from "@/app/auth/actions";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, User, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const emailValue = formData.get("email") as string;
    setEmail(emailValue);

    const result = await signUp(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setIsVerifying(true);
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await verifyOtpCode(email, otp);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Redirect to home on success
      window.location.href = "/";
    }
  }

  async function handleResendOtp() {
    setResendLoading(true);
    setResendMessage(null);
    const result = await resendOtpCode(email);
    if (result?.error) {
      setError(result.error);
    } else {
      setResendMessage("Mã mới đã được gửi!");
      setTimeout(() => setResendMessage(null), 3000);
    }
    setResendLoading(false);
  }

  // OTP Verification View
  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-slate-50 to-secondary/20 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-8 shadow-2xl backdrop-blur-xl md:p-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-secondary">
              <ShieldCheck size={40} />
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">Xác thực tài khoản</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Vui lòng nhập mã 6 số chúng tôi vừa gửi đến <br />
                <span className="font-bold text-slate-700">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100 italic">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Mã xác thực</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full tracking-[1em] text-center rounded-2xl border border-slate-200 bg-white/50 py-4 text-lg font-black outline-none transition-all focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-secondary py-4 text-sm font-black text-white transition-all hover:bg-secondary-dark hover:shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>Xác nhận mã OTP</>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="text-sm font-bold text-secondary hover:underline disabled:opacity-50"
              >
                {resendLoading ? "Đang gửi..." : "Gửi lại mã xác nhận"}
              </button>
              {resendMessage && (
                <p className="mt-2 text-xs font-bold text-green-600 animate-pulse">{resendMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-slate-50 to-secondary/20 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-8 shadow-2xl backdrop-blur-xl md:p-10">
          {/* Decorative spots */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-secondary/10 blur-2xl" />

          {/* Header */}
          <div className="relative mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Gia nhập QuizLM<span className="text-secondary">.</span>
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Đăng ký tài khoản để nhận nhiều ưu đãi SMember
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100 italic">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Họ và tên</label>
              <div className="relative">
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Email</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Số điện thoại</label>
              <div className="relative">
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="0901234567"
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Mật khẩu</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3.5 pl-11 pr-11 text-sm outline-none transition-all focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-secondary py-4 text-sm font-black text-white transition-all hover:bg-secondary-dark hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Tạo tài khoản ngay
                  <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-bold text-secondary hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
