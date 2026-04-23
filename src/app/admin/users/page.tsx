import React from "react";
import UserManager from "@/components/admin/UserManager";
import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Quản lý người dùng | Admin Portal",
  description: "Trang quản trị danh sách người dùng và phân quyền.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabase = await createClient();
  if (!supabase) return <div>Lỗi kết nối Server</div>;

  // Server-Side Timeout để chống treo trên Vercel Edge 3.0
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Supabase auth timeout in AdminUsersPage")), 5000)
  );

  let user = null;
  try {
    const response = await Promise.race([
      supabase.auth.getUser(),
      timeoutPromise
    ]) as { data: { user: User | null } }; 
    user = response?.data?.user;
  } catch (error: unknown) {
    console.error("AdminUsersPage Auth Timeout/Error:", error);
  }

  if (!user) redirect("/login?error=auth_timeout");

  // Kiểm tra vai trò admin 3.0
  const { data: profiles } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id);

  if (!profiles || profiles.length === 0 || profiles[0].role !== "admin") {
    redirect("/");
  }

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
