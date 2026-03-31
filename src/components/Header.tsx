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
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Heart } from "lucide-react";
import { isAdmin, getUserName } from "@/utils/auth-helpers";
import { signOut } from "@/app/auth/actions";
import { useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ProductService } from "@/services/productService";
import { Category } from "@/types/database";
import CategoryMenu from "./shop/CategoryMenu";
import SearchSuggestions from "./shop/SearchSuggestions";

import { ProductWithDetails } from "@/types/database";

/**
 * Header component 
 */
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = React.useState<SupabaseUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [hasMounted, setHasMounted] = React.useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);

  // Search States
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<ProductWithDetails[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const supabase = createClient();

  // Stores
  const { getTotalItems, fetchCart, clearCart } = useCartStore();
  const { fetchWishlist, clearWishlist } = useWishlistStore();

  const handleSignOut = () => {
    startTransition(async () => {
      clearCart();
      clearWishlist();
      await signOut();
    });
  };

  // Debounced Search Logic
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const { data } = await ProductService.searchProducts(supabase!, searchQuery, 1, 5);
      setSuggestions(data);
      setShowSuggestions(true);
      setIsSearching(false);
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, supabase]);

  // Fetch Categories once
  React.useEffect(() => {
    const fetchCategories = async () => {
      const data = await ProductService.getCategories(supabase!);
      setCategories(data);
    };
    fetchCategories();
  }, [supabase]);

  React.useEffect(() => {
    const getUser = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (user) {
        fetchCart(user.id);
        fetchWishlist(user.id);
      }
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      setLoading(false);

      if (newUser) {
        fetchCart(newUser.id);
        fetchWishlist(newUser.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchCart, fetchWishlist]);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Close menu if route changes
  React.useEffect(() => {
    setIsCategoryOpen(false);
    setShowSuggestions(false);
  }, [pathname]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Hide header on admin and auth pages
  const isAuthPage = ["/login", "/register", "/forgot-password"].some(p => pathname?.startsWith(p));
  if (pathname?.startsWith("/admin") || isAuthPage) {
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
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-primary hover:text-white md:flex active:scale-95"
          >
            <Menu size={20} className={isCategoryOpen ? "rotate-90 transition-transform" : "transition-transform"} />
            Danh mục
          </button>
        </div>

        {/* Mega Menu Integration */}
        <CategoryMenu
          categories={categories}
          isOpen={isCategoryOpen}
          onClose={() => setIsCategoryOpen(false)}
        />

        {/* Search Bar */}
        <div className="relative flex-1">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Bạn cần tìm gì?"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
              <Search size={18} />
            </button>
          </form>

          {/* Search Suggestions Integration */}
          <SearchSuggestions
            suggestions={suggestions}
            isOpen={showSuggestions}
            isLoading={isSearching}
            searchQuery={searchQuery}
            onClose={() => setShowSuggestions(false)}
          />
        </div>

        {/* Actions */}
        <div className="hidden items-center gap-1 md:flex">
          <HeaderAction icon={<MapPin size={20} />} label="Cửa hàng" subLabel="Gần bạn" />
          <HeaderAction
            href="/track-order"
            icon={<Box size={20} />}
            label="Đơn hàng"
            subLabel="Tra cứu"
          />

          {!loading && user ? (
            <div className="flex items-center gap-1">
              <div className="group relative">
                <HeaderAction
                  id="user-menu-target"
                  icon={<User size={20} className="text-primary" />}
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
                    {isAdmin(user) && (
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
          ) : (
            <Link href="/login">
              <HeaderAction icon={<User size={20} />} label="Thông tin" subLabel="Bản thân" />
            </Link>
          )}


          <div className="flex items-center gap-1">
            <button
              id="cart-icon-target"
              onClick={() => {
                if (!user) {
                  router.push("/login?error=auth_required");
                } else {
                  router.push("/cart");
                }
              }}
              className="relative ml-2 flex flex-col items-center gap-0.5 rounded-xl p-2 text-primary transition-colors hover:bg-primary/10"
            >
              <motion.div
                key={hasMounted ? getTotalItems() : 0}
                animate={getTotalItems() > 0 ? {
                  scale: [1, 1.3, 1],
                  rotate: [0, -10, 10, 0]
                } : {}}
                transition={{ duration: 0.4 }}
              >
                <ShoppingCart size={24} />
              </motion.div>
              <span className="text-[10px] font-bold">Giỏ hàng</span>
              <AnimatePresence>
                {hasMounted && getTotalItems() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    key="badge"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white ring-2 ring-white"
                  >
                    {getTotalItems()}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <button className="rounded-xl p-2 text-slate-600 md:hidden">
          <Menu size={24} />
        </button>
      </div>
    </header>
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
    <button
      id={id}
      onClick={onClick}
      className={className}
    >
      {content}
    </button>
  );
}
