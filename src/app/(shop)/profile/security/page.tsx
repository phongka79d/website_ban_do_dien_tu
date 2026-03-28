"use client";

import React, { useState, useTransition } from "react";
import { Loader2, KeyRound, ShieldAlert, Mail } from "lucide-react";
import { updatePassword, requestPasswordResetOtp } from "@/app/auth/profile-actions";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SecurityPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "succ" | "err"; text: string } | null>(null);
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      return setMessage({ type: "err", text: "Mật khẩu phải từ 6 ký tự trở lên!" });
    }
    if (newPassword !== confirmPassword) {
      return setMessage({ type: "err", text: "Mật khẩu xác nhận không khớp!" });
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("newPassword", newPassword);
      const res = await updatePassword(formData);
      
      if (res.error) {
        setMessage({ type: "err", text: res.error });
      } else {
        setMessage({ type: "succ", text: "Đổi mật khẩu thành công! Hệ thống đang đăng xuất..." });
        
        // Buộc đăng xuất sau 2s
        setTimeout(async () => {
          const supabase = createClient();
          if (supabase) await supabase.auth.signOut();
          window.location.href = "/login";
        }, 2000);
      }
    });
  };

  const handleRequestOtp = async () => {
    setMessage(null);
    startTransition(async () => {
      const res = await requestPasswordResetOtp();
      if (res.error) {
        setMessage({ type: "err", text: res.error });
      } else {
        setMessage({ type: "succ", text: res.message || "Đã gửi OTP!" });
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

      <div className="p-6 md:p-8 space-y-10">
        {message && (
          <div className={`rounded-2xl p-4 text-sm font-bold border animate-in slide-in-from-top-4 ${message.type === 'err' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
            {message.text}
          </div>
        )}

        {/* Cấp độ 1: Đổi trực tiếp */}
        <section className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <KeyRound className="text-primary" size={20}/>
              Thay đổi mật khẩu trực tiếp
            </h3>
            <p className="text-sm text-slate-500">Mật khẩu mới phải có ít nhất 6 ký tự. Cập nhật thành công sẽ cần đăng nhập lại.</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="space-y-1.5">
              <label className="text-sm font-black text-slate-700">Mật khẩu mới</label>
              <input
                type="password" required minLength={6}
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 tracking-[0.2em]"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-black text-slate-700">Xác nhận mật khẩu</label>
              <input
                type="password" required minLength={6}
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 tracking-[0.2em]"
              />
            </div>

            <button
              disabled={isPending || newPassword.length < 6}
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-black text-white hover:bg-amber-600 hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
            >
              {isPending ? <Loader2 className="animate-spin" size={18} /> : <span>Thiết lập mật khẩu mới</span>}
            </button>
          </form>
        </section>

        <hr className="border-slate-100" />

        {/* Cấp độ 2: Request OTP */}
        <section className="space-y-4 max-w-xl">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Mail className="text-primary" size={20}/>
              Xác thực qua Email (Link OTP)
            </h3>
            <p className="text-sm text-slate-500">Nếu bạn bị lộ mật khẩu cũ hoặc không thể nhớ, hãy yêu cầu gửi một Lệnh Khôi Phục về thẳng Email gốc của bạn.</p>
          </div>
          
          <button
            onClick={handleRequestOtp}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-50 border border-indigo-200 px-6 py-3.5 text-sm font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition-all active:scale-95"
          >
            {isPending ? <Loader2 className="animate-spin" size={18} /> : <span>Gửi Lệnh Reset Mật khẩu về Email</span>}
          </button>
        </section>

      </div>
    </div>
  );
}
