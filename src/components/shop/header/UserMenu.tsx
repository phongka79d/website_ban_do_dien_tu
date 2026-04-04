"use client";

import React from "react";
import Link from "next/link";
import { User, LogOut, LayoutDashboard, Loader2, Heart, MapPin, Box, ShoppingCart, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { clearCart, fetchCart, getTotalItems } = useCartStore();
  const { clearWishlist, fetchWishlist } = useWishlistStore();

  // Close menu on navigation or click outside
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    startTransition(async () => {
      clearCart();
      clearWishlist();
      await signOut();
    });
  };

  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    let mounted = true;

    const loadUserData = async () => {
      if (!supabase) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        // Add a safety timeout to prevent infinite loading on Vercel
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Auth fetch timeout")), 4000)
        );

        const { data: { user } } = await Promise.race([
          supabase.auth.getUser(),
          timeoutPromise
        ]) as any;

        if (!mounted) return;
        setUser(user);

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (mounted) {
            setUserProfile(profile);
            if (!pathname?.startsWith("/admin")) {
              fetchCart(user.id);
              fetchWishlist(user.id);
            }
          }
        } else {
          if (mounted) setUserProfile(null);
        }
      } catch (error) {
        console.warn("UserMenu Load Auth Warning:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUserData();

    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      if (mounted) setUser(newUser);

      if (newUser) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", newUser.id)
            .single();

          if (mounted) {
            setUserProfile(profile);
            if (!pathname?.startsWith("/admin")) {
              fetchCart(newUser.id);
              fetchWishlist(newUser.id);
            }
          }
        } catch (error) {
          console.error("Error updating profile on auth change:", error);
        }
      } else {
        if (mounted) {
          setUserProfile(null);
          clearCart();
          clearWishlist();
        }
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchCart, fetchWishlist, pathname, clearCart, clearWishlist]);

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
    <div className="flex items-center gap-1" ref={menuRef}>
      <div className="hidden items-center gap-1 md:flex">
        <HeaderAction
          href="/track-order"
          icon={<Box size={20} />}
          label="Đơn hàng"
          subLabel="Tra cứu"
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-100 md:px-3"
        >
          <Avatar
            src={getUserAvatar(user)}
            fallbackName={getUserName(user)}
            size={28}
            className="ring-1 ring-primary/10 border-primary/20 shadow-sm md:size-24"
          />
          <div className="hidden flex-col items-start leading-tight md:flex">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Xin chào</span>
            <span className="text-xs font-bold text-slate-800">{getUserName(user)}</span>
          </div>
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full z-50 w-56 pt-2"
            >
              <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 flex flex-col gap-1">
                {/* Mobile Extra Actions */}
                <div className="flex flex-col gap-1 pb-1 mb-1 border-b border-slate-100 md:hidden">

                  <Link
                    href="/track-order"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Box size={18} className="text-slate-500" />
                    Theo dõi đơn hàng
                  </Link>
                </div>

                <Link
                  href="/profile"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <User size={18} className="text-slate-500" />
                  Thông tin cá nhân
                </Link>
                <Link
                  href="/wishlist"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Heart size={18} className="text-red-500" />
                  Yêu thích
                </Link>
                {userProfile?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-50"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard Admin
                  </Link>
                )}
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={handleSignOut}
                  disabled={isPending}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
                  {isPending ? "Đang xử lý..." : "Đăng xuất"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
