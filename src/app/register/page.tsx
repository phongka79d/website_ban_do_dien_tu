"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signUp, verifyOtpCode, resendOtpCode } from "@/app/auth/actions";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import OtpField from "@/components/auth/OtpField";
import { Button } from "@/components/ui/Button";

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
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
      window.location.href = "/";
    }
  }

  async function handleResendOtp() {
    const result = await resendOtpCode(email);
    if (result?.error) setError(result.error);
  }

  // OTP Verification View
  if (isVerifying) {
    return (
      <AuthCard>
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
          <OtpField value={otp} onChange={setOtp} onResend={handleResendOtp} initialCountdown={0} label="Mã xác thực" accentColor="secondary" />
          <Button 
            type="submit" 
            variant="secondary"
            isLoading={loading} 
            disabled={otp.length < 6}
            fullWidth
            size="lg"
          >
            Xác nhận mã OTP
          </Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="relative mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Gia nhập QuizLM<span className="text-secondary">.</span>
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Đăng ký tài khoản để nhận nhiều ưu đãi SMember
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100 italic">
            {error}
          </div>
        )}

        <AuthInput
          label="Họ và tên"
          icon={<UserIcon />}
          name="fullName"
          type="text"
          required
          placeholder="Nguyễn Văn A"
          accentColor="secondary"
        />
        <AuthInput
          label="Email"
          icon={<Mail size={18} />}
          name="email"
          type="email"
          required
          placeholder="name@example.com"
          accentColor="secondary"
        />
        <AuthInput
          label="Số điện thoại"
          icon={<PhoneIcon />}
          name="phone"
          type="tel"
          required
          placeholder="0901234567"
          accentColor="secondary"
        />
        <AuthInput
          label="Mật khẩu"
          icon={<Lock size={18} />}
          rightSlot={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-secondary transition-colors cursor-pointer">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          name="password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="••••••••"
          accentColor="secondary"
        />

        <Button
          type="submit"
          variant="secondary"
          isLoading={loading}
          fullWidth
          size="lg"
          rightIcon={<ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1" />}
        >
          Tạo tài khoản ngay
        </Button>
      </form>

      <p className="mt-8 text-center text-sm font-medium text-slate-500">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-bold text-secondary hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
    </AuthCard>
  );
}
