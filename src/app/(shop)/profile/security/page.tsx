"use client";

import React, { useState, useTransition } from "react";
import { Loader2, KeyRound, ShieldAlert, Eye, EyeOff, ShieldCheck } from "lucide-react";
import OtpField from "@/components/auth/OtpField";
import { verifyOldPasswordAndSendOtp, verifyOtpAndChangePassword } from "@/app/auth/profile-actions";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const Requirement = ({ met, text }: { met: boolean; text: string }) => {
  if (met) return null;
  return (
    <div className="text-red-400/80 italic text-[12px] font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
      <div className="w-1 h-1 rounded-full bg-red-400/50" />
      {text}
    </div>
  );
};

export default function SecurityPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "succ" | "err"; text: string } | null>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validation = {
    length: newPassword.length >= 6,
    hasUpper: /[A-Z]/.test(newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(newPassword)
  };

  const isPasswordValid = validation.length && validation.hasUpper && validation.hasSpecial;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isPasswordValid) return setMessage({ type: "err", text: "Mật khẩu mới không đạt yêu cầu bảo mật!" });
    if (newPassword !== confirmPassword) return setMessage({ type: "err", text: "Mật khẩu xác nhận không khớp!" });

    startTransition(async () => {
      const formData = new FormData();
      formData.append("oldPassword", oldPassword);
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      const res = await verifyOldPasswordAndSendOtp(formData);

      if (res.error) {
        setMessage({ type: "err", text: res.error });
      } else {
        setMessage({ type: "succ", text: "✅ Đã gửi mã OTP 6 số về Email của bạn. Vui lòng kiểm tra hộp thư!" });
        setStep(2);
      }
    });
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (otp.length !== 6) return setMessage({ type: "err", text: "Mã OTP phải có đúng 6 chữ số!" });

    startTransition(async () => {
      const formData = new FormData();
      formData.append("otp", otp);
      formData.append("newPassword", newPassword);

      const res = await verifyOtpAndChangePassword(formData);

      if (res.error) {
        setMessage({ type: "err", text: res.error });
      } else {
        setMessage({ type: "succ", text: "Đổi mật khẩu thành công! Hệ thống đang đăng xuất tải lại..." });

        // Buộc đăng xuất sau 2s
        setTimeout(async () => {
          const supabase = createClient();
          if (supabase) await supabase.auth.signOut();
          window.location.href = "/login";
        }, 2000);
      }
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="border-b border-slate-100 bg-slate-50/50 p-6 md:p-8">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <ShieldAlert className="text-amber-500" size={24} />
          Bảo mật & Mật khẩu
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Cập nhật và tăng cường bảo vệ tài khoản</p>
      </div>

      <div className="p-6 md:p-8 space-y-8 min-h-[400px]">
        {message && (
          <div className={`rounded-2xl p-4 text-sm font-bold border animate-in slide-in-from-top-4 ${message.type === 'err' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
            {message.text}
          </div>
        )}

        {/* BƯỚC 1: NHẬP PASS */}
        {step === 1 && (
          <section className="space-y-6 max-w-3xl w-full animate-in fade-in slide-in-from-left-4">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <KeyRound className="text-primary" size={20} />
                Đổi mật khẩu bảo mật (Xác minh OTP)
              </h3>
              <p className="text-sm text-slate-500">Bạn cần nhập mật khẩu cũ. Một mã xác minh sẽ được tự động gửi về Email bảo vệ.</p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-5 bg-slate-50 p-6 rounded-3xl border border-slate-100">

              <div className="space-y-1.5">
                <label className="text-sm font-black text-slate-700">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"} required
                    value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                    placeholder="••••••"
                    className={`w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 pr-12 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 ${!showOldPassword && oldPassword ? 'tracking-[0.2em]' : ''}`}
                  />
                  <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors flex items-center justify-center p-1">
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-black text-slate-700">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"} required minLength={6}
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••"
                    className={`w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 pr-12 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 ${!showNewPassword && newPassword ? 'tracking-[0.2em]' : ''}`}
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors flex items-center justify-center p-1">
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Requirements Checklist - Vertical & Hidden when met */}
                {newPassword && !isPasswordValid && (
                  <div className="flex flex-col gap-1.5 p-1 px-4 animate-in slide-in-from-top-2 duration-300">

                    <Requirement met={validation.length} text="Yêu cầu tối thiểu 6 ký tự" />
                    <Requirement met={validation.hasUpper} text="Cần ít nhất 1 chữ hoa" />
                    <Requirement met={validation.hasSpecial} text="Cần ít nhất 1 kí đặc biệt" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-black text-slate-700">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"} required minLength={6}
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    className={`w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 pr-12 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 ${!showConfirmPassword && confirmPassword ? 'tracking-[0.2em]' : ''}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors flex items-center justify-center p-1">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                disabled={isPending || !isPasswordValid || !oldPassword || newPassword !== confirmPassword}
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black text-white hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 transition-all active:scale-95"
              >
                {isPending ? <Loader2 className="animate-spin" size={18} /> : <span>Tiếp tục (Lấy mã OTP)</span>}
              </button>
            </form>
          </section>
        )}

        {/* BƯỚC 2: XÁC THỰC OTP */}
        {step === 2 && (
          <section className="space-y-6 max-w-3xl w-full animate-in fade-in slide-in-from-right-4 relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/50 p-8">
            <div className="text-center mb-8">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Xác nhận đổi mật khẩu
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Vui lòng nhập mã 6 số chúng tôi vừa gửi đến Email của bạn
              </p>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-6">
              <OtpField
                value={otp}
                onChange={setOtp}
                label="Mã xác thực"
                accentColor="primary"
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => { setStep(1); setMessage(null); setOtp(""); }}
                  className="w-full sm:w-1/3 flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  disabled={isPending || otp.length !== 6}
                  type="submit"
                  className="w-full flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-black text-white hover:bg-primary-dark hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
                >
                  {isPending ? <Loader2 className="animate-spin" size={20} /> : <span>Xác nhận mã OTP</span>}
                </button>
              </div>
            </form>
          </section>
        )}

      </div>
    </div>
  );
}
