"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signUp, verifyOtpCode, resendOtpCode } from "@/app/auth/actions";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import OtpField from "@/components/auth/OtpField";
import { Button } from "@/components/ui/Button";

const Requirement = ({ met, text }: { met: boolean; text: string }) => {
  if (met) return null;
  return (
    <div className="text-red-400/80 italic text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 mt-1">
      <div className="w-1 h-1 rounded-full bg-red-400/50" />
      {text}
    </div>
  );
};

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

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "@/lib/validations/auth";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");

  const validation = {
    length: passwordValue.length >= 8,
    hasUpper: /[A-Z]/.test(passwordValue),
    hasNumber: /[0-9]/.test(passwordValue),
    hasSpecial: /[^A-Za-z0-9]/.test(passwordValue)
  };

  const isPasswordValid = validation.length && validation.hasUpper && validation.hasNumber && validation.hasSpecial;

  async function onRegisterSubmit(data: RegisterFormData) {
    setLoading(true);
    setGlobalError(null);
    setUserEmail(data.email);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));

    const result = await signUp(formData);

    if (result?.error) {
      setGlobalError(result.error);
      setLoading(false);
    } else {
      setIsVerifying(true);
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setGlobalError(null);

    const result = await verifyOtpCode(userEmail, otp);

    if (result?.error) {
      setGlobalError(result.error);
      setLoading(false);
    } else {
      const returnTo = searchParams.get("returnTo");
      const isValidRedirect = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//");
      window.location.href = isValidRedirect ? returnTo : "/";
    }
  }

  async function handleResendOtp() {
    const result = await resendOtpCode(userEmail);
    if (result?.error) setGlobalError(result.error);
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
            <span className="font-bold text-slate-700">{userEmail}</span>
          </p>
        </div>
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          {globalError && (
            <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100 italic">
              {globalError}
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
          Gia nhập TSShop
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Đăng ký tài khoản để nhận nhiều ưu đãi SMember
        </p>
      </div>

      <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-5">
        {globalError && (
          <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100 italic">
            {globalError}
          </div>
        )}

        <AuthInput
          label="Họ và tên"
          icon={<UserIcon />}
          {...register("full_name")}
          error={errors.full_name?.message}
          type="text"
          placeholder="Nguyễn Văn A"
          accentColor="secondary"
        />
        <AuthInput
          label="Email"
          icon={<Mail size={18} />}
          {...register("email")}
          error={errors.email?.message}
          type="email"
          placeholder="name@example.com"
          accentColor="secondary"
        />
        <AuthInput
          label="Số điện thoại"
          icon={<PhoneIcon />}
          {...register("phone")}
          error={errors.phone?.message}
          type="tel"
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
          {...register("password")}
          error={errors.password?.message}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          accentColor="secondary"
        />
        
        {/* Requirements Checklist - Vertical & Hidden when met */}
        {passwordValue && !isPasswordValid && (
          <div className="flex flex-col gap-1 px-4 animate-in slide-in-from-top-1 duration-300">
            <p className="text-[12px] text-slate-500 mb-1 italic">Mật khẩu cần đạt tiêu chuẩn bảo mật sau:</p>
            <Requirement met={validation.length} text="Yêu cầu tối thiểu 8 ký tự" />
            <Requirement met={validation.hasUpper} text="Cần ít nhất 1 chữ IN HOA" />
            <Requirement met={validation.hasNumber} text="Cần ít nhất 1 chữ số (0-9)" />
            <Requirement met={validation.hasSpecial} text="Cần ít nhất 1 ký tự đặc biệt (@, #, $,...)" />
          </div>
        )}

        <AuthInput
          label="Xác nhận mật khẩu"
          icon={<Lock size={18} />}
          {...register("confirm_password")}
          error={errors.confirm_password?.message}
          type={showPassword ? "text" : "password"}
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
        <Link 
          href={searchParams.get("returnTo") ? `/login?returnTo=${encodeURIComponent(searchParams.get("returnTo")!)}` : "/login"} 
          className="font-bold text-secondary hover:underline"
        >
          Đăng nhập ngay
        </Link>
      </p>
    </AuthCard>
  );
}

