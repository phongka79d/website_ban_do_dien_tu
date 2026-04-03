"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProductWithDetails } from "@/types/database";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { ProductImage } from "../common/ProductImage";
import { formatCurrency } from "@/utils/format";
import { Button } from "../ui/Button";

interface SearchSuggestionsProps {
  suggestions: ProductWithDetails[];
  isOpen: boolean;
  isLoading: boolean;
  searchQuery: string;
  onClose: () => void;
}

/**
 * Search Suggestions dropdown component.
 */
export default function SearchSuggestions({ 
  suggestions, 
  isOpen, 
  isLoading, 
  searchQuery,
  onClose 
}: SearchSuggestionsProps) {
  if (!isOpen || !searchQuery.trim()) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="suggestions-panel"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl ring-1 ring-black/5"
      >
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Đang tìm kiếm...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="mb-2 px-3 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Sản phẩm gợi ý
              </div>
              <div className="flex flex-col gap-1">
                {suggestions.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={onClose}
                    className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center">
                      {product.image_url ? (
                        <ProductImage
                          src={product.image_url}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="object-contain transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <Search size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col truncate">
                      <span className="truncate text-sm font-bold text-slate-800 group-hover:text-primary">
                        {product.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-primary">
                          {formatCurrency(product.price)}
                        </span>
                        {product.categories && (
                          <span className="text-[10px] font-medium text-slate-400">
                            • {product.categories.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={14} className="mr-2 text-slate-300 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-primary" />
                  </Link>
                ))}
              </div>
              <div className="mt-2 border-t border-slate-50 p-2">
                <Button
                  as={Link}
                  href={`/products?q=${encodeURIComponent(searchQuery.trim())}`}
                  onClick={onClose}
                  variant="soft"
                  fullWidth
                  className="rounded-xl"
                >
                  Xem tất cả kết quả cho &quot;{searchQuery}&quot;
                </Button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-slate-500">
                Không tìm thấy sản phẩm nào khớp với &quot;<span className="text-slate-900">{searchQuery}</span>&quot;
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
