"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Category } from "@/types/database";
import { ChevronRight, LayoutGrid, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CategoryMenuProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mega Menu component for listing all categories. (Text-only as requested)
 */
export default function CategoryMenu({ categories, isOpen, onClose }: CategoryMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mega Menu Content */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute left-1/2 top-full z-50 mt-4 w-full max-w-5xl -translate-x-1/2 overflow-hidden rounded-[32px] border border-slate-100 bg-white/95 shadow-2xl backdrop-blur-xl ring-1 ring-black/5"
          >
            <div className="p-8">
              <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <LayoutGrid size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Tất cả Danh mục</h3>
                    <p className="text-xs font-medium text-slate-500">Khám phá sản phẩm theo từng nhóm phân loại</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Grid of Categories */}
              {categories.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={onClose}
                      className="group flex items-center justify-between rounded-2xl border border-slate-50 bg-slate-50/50 p-4 transition-all hover:border-primary/20 hover:bg-white hover:shadow-md hover:shadow-primary/5"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-slate-800 transition-colors group-hover:text-primary capitalize">
                          {cat.name}
                        </span>
                        {cat.description && (
                          <span className="line-clamp-1 text-[10px] font-medium text-slate-400">
                            {cat.description}
                          </span>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 font-medium">
                  Đang tải danh mục...
                </div>
              )}

              {/* Bottom Bar */}
              <div className="mt-8">
                <Button 
                  as={Link}
                  href="/products" 
                  onClick={onClose}
                  variant="soft"
                  fullWidth
                  className="rounded-2xl"
                >
                  Xem tất cả sản phẩm
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
