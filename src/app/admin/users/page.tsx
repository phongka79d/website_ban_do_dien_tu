import React from "react";
import UserManager from "@/components/admin/UserManager";
import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Quản lý người dùng | Admin Portal",
  description: "Trang quản trị danh sách người dùng và phân quyền.",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  if (!supabase) return <div>Lỗi kết nối Server</div>;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý người dùng</h1>
        <p className="text-slate-500 font-medium mt-1">Theo dõi, phân quyền và quản lý trạng thái hoạt động của khách hàng.</p>
      </div>

      <UserManager currentAdminId={user.id} />
    </div>
  );
}
