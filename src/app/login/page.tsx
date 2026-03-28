"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/app/auth/actions";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  React.useEffect(() => {
    if (errorParam === "blocked") {
      setError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ bộ phận CSKH.");
    }
  }, [errorParam]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await signIn(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <AuthCard>
      <div className="relative mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Chào mừng trở lại<span className="text-primary">.</span>
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Đăng nhập để trải nghiệm công nghệ cùng QuizLM
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100 italic">
            {error}
          </div>
        )}

        <AuthInput
          label="Email"
          icon={<Mail size={18} />}
          name="email"
          type="email"
          required
          placeholder="Email"
        />

        <AuthInput
          label="Mật khẩu"
          icon={<Lock size={18} />}
          labelSlot={
            <Link href="/forgot-password" className="font-bold text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          }
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          name="password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="••••••••"
        />

        <Button
          type="submit"
          isLoading={loading}
          fullWidth
          size="lg"
          rightIcon={<ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1" />}
        >
          Đăng nhập
        </Button>
      </form>

      <p className="mt-8 text-center text-sm font-medium text-slate-500">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-bold text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </AuthCard>
  );
}
