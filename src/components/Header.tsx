"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import CategoryMenu from "./shop/CategoryMenu";
import SearchField from "./shop/header/SearchField";
import UserMenu from "./shop/header/UserMenu";

import { useCartStore } from "@/store/useCartStore";
import { ProductService } from "@/services/productService";
import { Category, Brand } from "@/types/database";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

/**
 * Header component - Refactored version
 */
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [hasMounted, setHasMounted] = React.useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [brands, setBrands] = React.useState<Brand[]>([]);

  const supabase = createClient();
  const { getTotalItems } = useCartStore();

  // Fetch Categories & Brands
  React.useEffect(() => {
    const fetchData = async () => {
      if (!supabase) return;
      try {
        const [catData, brandData] = await Promise.all([
          ProductService.getCategories(supabase),
          ProductService.getBrands(supabase)
        ]);
        setCategories(catData || []);
        setBrands(brandData || []);
      } catch (error) {
        console.error("Error fetching header data:", error);
      }
    };
    fetchData();
  }, [supabase]);

  React.useEffect(() => {
    setHasMounted(true);
    setIsCategoryOpen(false);
  }, [pathname]);

  // Hide header on admin and auth pages
  const isAuthPage = ["/login", "/register", "/forgot-password"].some(p => pathname?.startsWith(p));
  if (pathname?.startsWith("/admin") || isAuthPage) {
    return null;
  }

  return (
    <>
      <CategoryMenu
        categories={categories}
        brands={brands}
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
      />

      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 md:gap-4 md:px-8">
          {/* Logo & Category Trigger */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsCategoryOpen(true)}
              className="flex items-center justify-center rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
            >
              <Menu size={24} />
            </button>

            <div className="text-xl font-black tracking-tighter text-primary md:text-2xl">
              <Link href="/">
                TS<span className="text-secondary italic">Shop</span>
              </Link>
            </div>

            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-primary hover:text-white md:flex active:scale-95"
            >
              <Menu size={20} className={isCategoryOpen ? "rotate-90 transition-transform" : "transition-transform"} />
              Danh mục
            </button>
          </div>

          {/* Search Area (Desktop & Tablet) */}
          <SearchField />

          {/* User Menu & Actions */}
          <div className="flex flex-1 items-center justify-end gap-1 md:flex-none">
            <UserMenu />

            {/* Cart Trigger */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => router.push("/cart")}
                className="relative flex flex-col items-center gap-0.5 rounded-xl p-2 text-primary transition-colors hover:bg-primary/10 active:scale-95 md:ml-2"
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
                <span className="hidden text-[10px] font-bold md:block">Giỏ hàng</span>
                <AnimatePresence>
                  {hasMounted && getTotalItems() > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      key="badge"
                      className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[8px] font-bold text-white ring-2 ring-white md:-right-1 md:-top-1 md:h-5 md:w-5 md:text-[10px]"
                    >
                      {getTotalItems()}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
