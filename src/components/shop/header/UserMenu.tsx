"use client";

import React from "react";
import Link from "next/link";
import { User, LogOut, LayoutDashboard, Loader2, Heart, MapPin, Box } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Avatar } from "@/components/common/Avatar";
import { isAdmin, getUserName, getUserAvatar } from "@/utils/auth-helpers";
import { signOut } from "@/app/auth/actions";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { createClient } from "@/utils/supabase/client";

export default function UserMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = React.useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  
  const supabase = createClient();
  const { clearCart, fetchCart } = useCartStore();
  const { clearWishlist, fetchWishlist } = useWishlistStore();

  const handleSignOut = () => {
    startTransition(async () => {
      clearCart();
      clearWishlist();
      await signOut();
    });
  };

  React.useEffect(() => {
    const getUser = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Fetch real-time profile data (role)
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        
        setUserProfile(profile);

        if (!pathname?.startsWith("/admin")) {
          fetchCart(user.id);
          fetchWishlist(user.id);
        }
      }
      setLoading(false);
    };
    getUser();

    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);

      if (newUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", newUser.id)
          .single();
        
        setUserProfile(profile);

        if (!pathname?.startsWith("/admin")) {
          fetchCart(newUser.id);
          fetchWishlist(newUser.id);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchCart, fetchWishlist, pathname]);

  if (loading) return <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />;

  if (!user) {
    return (
      <Link
        href={`/login?returnTo=${encodeURIComponent(pathname)}`}
        className="hidden md:block"
      >
        <HeaderAction icon={<User size={20} />} label="Thành viên" subLabel="TSShop" />
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="hidden items-center gap-1 md:flex">
        <HeaderAction icon={<MapPin size={20} />} label="Cửa hàng" subLabel="Gần bạn" />
        <HeaderAction
          href="/track-order"
          icon={<Box size={20} />}
          label="Đơn hàng"
          subLabel="Tra cứu"
        />
      </div>

      <div className="group relative">
        <HeaderAction
          id="user-menu-target"
          icon={
            <Avatar 
              src={getUserAvatar(user)} 
              fallbackName={getUserName(user)}
              size={24}
              className="ring-1 ring-primary/10 border-primary/20 shadow-sm"
            />
          }
          label={getUserName(user)}
          subLabel="Xin chào"
        />
        <div className="absolute right-0 top-full hidden w-48 pt-2 group-hover:block">
          <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 flex flex-col gap-1">
            <Link
              href="/profile"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <User size={18} />
              Thông tin cá nhân
            </Link>
            <Link
              href="/wishlist"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Heart size={18} className="text-red-500" />
              Yêu thích
            </Link>
            {userProfile?.role === "admin" && (
              <Link
                href="/admin"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-50"
              >
                <LayoutDashboard size={18} />
                Dashboard Admin
              </Link>
            )}
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
  );
}

function HeaderAction({ id, icon, label, subLabel, onClick, href }: { id?: string; icon: React.ReactNode; label: string; subLabel: string; onClick?: () => void; href?: string }) {
  const content = (
    <>
      <div className="text-slate-600">{icon}</div>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{subLabel}</span>
        <span className="text-xs font-bold text-slate-800">{label}</span>
      </div>
    </>
  );

  const className = "flex items-center gap-2 rounded-xl px-3 py-1.5 transition-colors hover:bg-slate-100";

  if (href) {
    return (
      <Link href={href} id={id} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button id={id} onClick={onClick} className={className}>
      {content}
    </button>
  );
}
