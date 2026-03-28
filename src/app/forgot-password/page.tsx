"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { requestPasswordReset, resetPasswordWithOtp, resendRecoveryOtp } from "@/app/auth/actions";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import OtpField from "@/components/auth/OtpField";
import { Button, buttonVariants } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => (window.location.href = "/"), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

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
        setMessage("Mã xác thực đã được gửi đến Email của bạn.");
      }
    });
  }

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

  async function handleResendOtp() {
    setError(null);
    setMessage(null);
    const result = await resendRecoveryOtp(email);
    if (result?.error) setError(result.error);
    else setMessage("Mã xác thực mới đã được gửi!");
  }

  return (
    <AuthCard backHref="/login" showBack={step < 3}>
      {/* BƯỚC 1: NHẬP EMAIL */}
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
            <AuthInput
              label="Email của bạn"
              icon={<Mail size={18} />}
              name="email"
              type="email"
              required
              placeholder="example@gmail.com"
            />
            <Button
              type="submit"
              isLoading={isPending}
              fullWidth
              size="lg"
              rightIcon={<ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1" />}
            >
              Gửi mã xác nhận
            </Button>
          </form>
        </div>
      )}

      {/* BƯỚC 2: NHẬP OTP & PASS MỚI */}
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

            <OtpField value={otp} onChange={setOtp} onResend={handleResendOtp} initialCountdown={60} />

            <input type="hidden" name="otp" value={otp} />

            <AuthInput
              label="Mật khẩu mới"
              icon={<Lock size={18} />}
              rightSlot={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-primary transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
            />
            <AuthInput
              label="Xác nhận mật khẩu"
              icon={<Lock size={18} />}
              rightSlot={
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="hover:text-primary transition-colors">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder="••••••••"
            />

            <Button
              type="submit"
              variant="secondary"
              isLoading={isPending}
              disabled={otp.length < 6}
              fullWidth
              size="lg"
            >
              Cập nhật mật khẩu mới
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setStep(1)}
              className="mt-4 text-[10px] text-slate-400 font-bold"
            >
              Sai Email? Quay lại nhập lại
            </Button>
          </form>
        </div>
      )}

      {/* BƯỚC 3: THÀNH CÔNG */}
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
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              Vào Trang Chủ Ngay
            </Link>
          </div>
        </div>
      )}
    </AuthCard>
  );
}
