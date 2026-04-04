"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShieldCheck, PackageOpen } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getUserName, getUserAvatar } from "@/utils/auth-helpers";
import { Avatar } from "@/components/common/Avatar";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userData, setUserData] = useState<{ name: string; avatar: string | null } | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      const supabase = createClient();
      if (!supabase) {
        if (mounted) setUserData({ name: "Khách", avatar: null });
        return;
      }

      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Auth layout timeout")), 4000)
        );

        const { data: { user } } = await Promise.race([
          supabase.auth.getUser(),
          timeoutPromise
        ]) as any;

        if (user && mounted) {
          setUserData({
            name: getUserName(user),
            avatar: getUserAvatar(user),
          });
        }
      } catch (err) {
        console.warn("Profile Layout Load Warning", err);
        if (mounted) {
           // Provide a fallback name to exit the 'Đang tải...' state
           setUserData({ name: "Người dùng", avatar: null });
        }
      }
    };
    
    fetchUser();
    return () => { mounted = false; };
  }, [pathname]); // Refresh user data if pathname changes (after save)

  const menuItems = [
    { href: "/profile", label: "Hồ sơ cá nhân", icon: <User size={18} /> },
    { href: "/profile/security", label: "Bảo mật & Mật khẩu", icon: <ShieldCheck size={18} /> },
    { href: "/profile/orders", label: "Đơn mua của tôi", icon: <PackageOpen size={18} /> },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <h1 className="text-2xl font-black text-slate-900 mb-8">Quản lý Tài khoản</h1>
        
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-1/3 lg:w-1/4 shrink-0">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 mb-4">
                <Avatar 
                  src={userData?.avatar} 
                  fallbackName={userData?.name}
                  size={80}
                  className="mb-3 ring-4 ring-primary/5 shadow-inner"
                />
                <h3 className="font-bold text-slate-800 text-lg">{userData?.name || "Đang tải..."}</h3>
                <p className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full mt-2">Thành viên Smember</p>
              </div>

              <nav className="flex flex-col gap-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
