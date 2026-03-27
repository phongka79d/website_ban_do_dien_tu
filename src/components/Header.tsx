"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  Box,
  User,
  ShoppingCart,
  Menu,
  LogOut,
  LayoutDashboard,
  Loader2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { isAdmin, getUserName } from "@/utils/auth-helpers";
import { signOut } from "@/app/auth/actions";
import { useTransition } from "react";

/**
 * Header component 
 */
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = React.useState<SupabaseUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClient();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
      router.refresh();
    });
  };

  React.useEffect(() => {
    const getUser = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Hide header on admin pages (optional, but keep per existing logic)
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">
        {/* Logo & Category */}
        <div className="flex items-center gap-4">
          <div className="text-2xl font-black tracking-tighter text-primary">
            QuizLM<span className="text-secondary italic">.Store</span>
          </div>
          <button className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-primary hover:text-white md:flex">
            <Menu size={20} />
            Danh mục
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Bạn cần tìm gì?"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>

        {/* Actions */}
        <div className="hidden items-center gap-1 md:flex">
          <HeaderAction icon={<MapPin size={20} />} label="Cửa hàng" subLabel="Gần bạn" />
          <HeaderAction icon={<Box size={20} />} label="Đơn hàng" subLabel="Tra cứu" />

          {!loading && user ? (
            <div className="flex items-center gap-1">
              {isAdmin(user) && (
                <Link href="/admin">
                  <HeaderAction icon={<LayoutDashboard size={20} />} label="Quản trị" subLabel="Admin" />
                </Link>
              )}
              <div className="group relative">
                <HeaderAction
                  icon={<User size={20} className="text-primary" />}
                  label={getUserName(user)}
                  subLabel="Xin chào"
                />
                <div className="absolute right-0 top-full hidden w-48 pt-2 group-hover:block">
                  <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5">
                    <button
                      onClick={handleSignOut}
                      disabled={isPending}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      {isPending ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
                      {isPending ? "Đang xử lý..." : "Đăng xuất"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <HeaderAction icon={<User size={20} />} label="Thành viên" subLabel="Smember" />
            </Link>
          )}

          <button className="relative ml-2 flex flex-col items-center gap-0.5 rounded-xl p-2 text-primary transition-colors hover:bg-primary/10">
            <ShoppingCart size={24} />
            <span className="text-[10px] font-bold">Giỏ hàng</span>
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white ring-2 ring-white">
              0
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        <button className="rounded-xl p-2 text-slate-600 md:hidden">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}

function HeaderAction({ icon, label, subLabel }: { icon: React.ReactNode; label: string; subLabel: string }) {
  return (
    <button className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-colors hover:bg-slate-100">
      <div className="text-slate-600">{icon}</div>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{subLabel}</span>
        <span className="text-xs font-bold text-slate-800">{label}</span>
      </div>
    </button>
  );
}
