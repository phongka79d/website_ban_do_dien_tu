"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Loader2, Save, User, Phone, Mail, Link as LinkIcon, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { updateProfileInfo } from "@/app/auth/profile-actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { getUserName, getUserAvatar } from "@/utils/auth-helpers";

export default function ProfileGeneralPage() {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "succ" | "err"; text: string } | null>(null);

  // States
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        setFullName(getUserName(user));
        setPhone(user.user_metadata?.phone || "");
        setAvatarUrl(getUserAvatar(user) || "");
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    startTransition(async () => {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("phone", phone);
      formData.append("avatarUrl", avatarUrl);

      const result = await updateProfileInfo(formData);
      if (result.error) {
        setMessage({ type: "err", text: result.error });
      } else {
        setMessage({ type: "succ", text: "Cập nhật hồ sơ thành công!" });
        // Auto hide success message
        setTimeout(() => setMessage(null), 4000);
      }
    });
  };

  if (loading) return <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden 2xl:-mt-0 animate-in fade-in zoom-in-95 duration-500">
      <div className="border-b border-slate-100 bg-slate-50/50 p-6 md:p-8">
        <h2 className="text-xl font-black text-slate-800">Thông tin cá nhân</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Quản lý các thông tin định danh tĩnh của bạn</p>
      </div>

      <div className="p-6 md:p-8">
        {message && (
          <div className={`mb-6 rounded-2xl p-4 text-sm font-bold border ${message.type === 'err' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
          {/* Avatar Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <User size={16} className="text-primary"/> Ảnh đại diện (Avatar)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">Hoặc dán Link URL ảnh</label>
                  <div className="relative">
                    <input
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/image.png"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs font-medium text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <Info className="shrink-0" size={16} />
                  <span>Đổi ảnh tại đây sẽ cập nhật trên toàn hệ thống thời gian thực.</span>
                </div>
              </div>
              <div className="w-full">
                <ImageUpload
                  label="Upload Ảnh từ máy"
                  imageUrl={avatarUrl}
                  categoryFolder="web_ban_do_dien_tu/users/avatars"
                  onSuccess={(res) => setAvatarUrl(res.info.secure_url)}
                  onClose={() => {}}
                  onRemove={() => setAvatarUrl("")}
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Họ và tên hiển thị</label>
              <div className="relative">
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Số điện thoại</label>
              <div className="relative">
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Địa chỉ Email (Không thể đổi)</label>
              <div className="relative opacity-60 cursor-not-allowed">
                <input
                  disabled
                  value={email}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 py-3 pl-10 pr-4 text-sm font-semibold text-slate-600 outline-none"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-1">Để thay đổi email, vui lòng liên hệ Bộ phận Chăm sóc Khách hàng để chứng minh nhân thân.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              disabled={isPending}
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-black text-white transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 active:scale-95 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
