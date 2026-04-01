"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Brand } from "@/types/database";
import { ChevronRight, LayoutGrid, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CategoryMenuProps {
  categories: Category[];
  brands: Brand[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Custom Hook for media query
 */
function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

/**
 * Mega Menu component for listing all categories and brands. 
 * Optimized for both Left Sidebar (Mobile) and Centered Mega Menu (PC).
 */
export default function CategoryMenu({ categories, brands, isOpen, onClose }: CategoryMenuProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [activeTab, setActiveTab] = React.useState<"category" | "brand">("category");

  // Reset tab to category when opening
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab("category");
    }
  }, [isOpen]);

  const variants = {
    initial: isDesktop 
      ? { opacity: 0, y: -20, x: "-50%", scale: 0.98 } 
      : { x: "-100%", opacity: 1 },
    animate: isDesktop 
      ? { opacity: 1, y: 0, x: "-50%", scale: 1 } 
      : { x: 0, opacity: 1 },
    exit: isDesktop 
      ? { opacity: 0, y: -20, x: "-50%", scale: 0.95 } 
      : { x: "-100%", opacity: 1 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Menu Content */}
          <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className={`fixed z-[110] flex bg-white shadow-2xl md:max-w-5xl md:rounded-[32px] md:p-8 
              ${isDesktop 
                ? "left-1/2 top-20 w-full flex-col h-auto" 
                : "inset-y-0 left-0 w-[280px] flex-col h-full"
              }`}
          >
            {/* Header Area */}
            <div className={isDesktop ? "mb-6 flex items-center justify-between border-b border-slate-100 pb-4" : "border-b border-slate-100"}>
              {!isDesktop ? (
                <div className="flex items-center justify-between bg-white px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <LayoutGrid size={20} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Menu</h3>
                  </div>
                  <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 active:bg-slate-200">
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <LayoutGrid size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Khám phá sản phẩm</h3>
                    <p className="text-xs font-medium text-slate-500">Tìm kiếm theo danh mục hoặc thương hiệu</p>
                  </div>
                </div>
              )}
              {isDesktop && (
                <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Tab Switcher */}
            <div className={`flex gap-2 ${isDesktop ? "mb-6" : "px-4 py-3 bg-slate-50"}`}>
              {[
                { id: "category", label: "Danh mục", icon: <LayoutGrid size={16} /> },
                { id: "brand", label: "Theo Brand", icon: <ShieldCheck size={16} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all md:flex-none md:px-6
                    ${activeTab === tab.id ? "text-white" : "text-slate-500 hover:bg-slate-200/50"}`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 z-0 rounded-xl bg-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tab.icon}
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className={`flex-1 overflow-y-auto ${isDesktop ? "" : "p-4"}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className={isDesktop ? "min-h-[300px]" : ""}
                >
                  {activeTab === "category" ? (
                    <div className={`gap-1 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4 ${isDesktop ? "" : "flex flex-col"}`}>
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            onClick={onClose}
                            className="group flex items-center justify-between rounded-2xl border border-transparent p-4 transition-all hover:bg-slate-50 md:border-slate-50 md:bg-slate-50/50 md:flex-col md:items-start md:min-h-[80px] md:hover:border-primary/20 md:hover:bg-white md:hover:shadow-md"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-black text-slate-800 group-hover:text-primary capitalize md:line-clamp-1">{cat.name}</span>
                              {cat.description && <span className="line-clamp-1 text-[10px] font-medium text-slate-400 md:line-clamp-2">{cat.description}</span>}
                            </div>
                            <ChevronRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-primary md:mt-2" />
                          </Link>
                        ))
                      ) : (
                        <div className="col-span-full py-12 text-center text-slate-400 font-medium">Đang tải danh mục...</div>
                      )}
                    </div>
                  ) : (
                    <div className={`gap-1 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4 ${isDesktop ? "" : "flex flex-col"}`}>
                      {brands.length > 0 ? (
                        brands.map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/products?brand=${brand.id}`}
                            onClick={onClose}
                            className="group flex items-center justify-between rounded-2xl border border-transparent p-4 transition-all hover:bg-slate-50 md:border-slate-50 md:bg-slate-50/50 md:flex-col md:items-start md:min-h-[80px] md:hover:border-primary/20 md:hover:bg-white md:hover:shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 transition-transform group-hover:scale-110">
                                {brand.logo_url ? (
                                  <img src={brand.logo_url} alt={brand.name} className="h-5 w-5 object-contain grayscale group-hover:grayscale-0" />
                                ) : (
                                  <span className="text-[10px] font-black text-primary">{brand.name.substring(0,2)}</span>
                                )}
                              </div>
                              <span className="text-sm font-black text-slate-800 group-hover:text-primary capitalize">{brand.name}</span>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-primary md:mt-2" />
                          </Link>
                        ))
                      ) : (
                        <div className="col-span-full py-12 text-center text-slate-400 font-medium">Đang tải thương hiệu...</div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Button */}
            <div className={`p-4 md:mt-8 md:p-0 ${isDesktop ? "" : "border-t border-slate-100"}`}>
              <Button as={Link} href="/products" onClick={onClose} variant="soft" fullWidth className="rounded-2xl py-6 font-black md:py-4">
                Xem tất cả sản phẩm
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
