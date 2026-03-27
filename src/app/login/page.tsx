"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/app/auth/actions";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

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
      // Redirect happens automatically via middleware/actions if successful
      window.location.href = "/";
    }
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
              Chào mừng trở lại<span className="text-primary">.</span>
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Đăng nhập để trải nghiệm công nghệ cùng QuizLM
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
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">
                Email
              </label>
              <div className="relative">
                <input
                  name="identifier"
                  type="text"
                  required
                  placeholder="Email"
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">Mật khẩu</label>
                <Link href="#" className="text-[10px] font-bold text-primary hover:underline">Quên mật khẩu?</Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3 pl-11 pr-11 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-primary py-4 text-sm font-black text-white transition-all hover:bg-primary-dark hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Đăng nhập ngay
                  <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-bold text-primary hover:underline">
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
