"use client";

import React from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProductService } from "@/services/productService";
import { ProductWithDetails } from "@/types/database";
import { createClient } from "@/utils/supabase/client";
import SearchSuggestions from "../SearchSuggestions";

interface SearchFieldProps {
  initialQuery?: string;
}

export default function SearchField({ initialQuery = "" }: SearchFieldProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const [suggestions, setSuggestions] = React.useState<ProductWithDetails[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const supabase = createClient();

  // Debounced Search Logic
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      if (supabase) {
        const { data } = await ProductService.searchProducts(supabase, searchQuery, 1, 5);
        setSuggestions(data || []);
      }
      setShowSuggestions(true);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, supabase]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setIsSearchOpen(false);
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Mobile Search Trigger */}
      <button
        onClick={() => setIsSearchOpen(true)}
        className="flex items-center justify-center rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
      >
        <Search size={22} />
      </button>

      {/* Desktop Search Field */}
      <div className="relative hidden flex-1 md:block">
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
            {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </button>
        </form>

        <SearchSuggestions
          suggestions={suggestions}
          isOpen={showSuggestions}
          isLoading={isSearching}
          searchQuery={searchQuery}
          onClose={() => setShowSuggestions(false)}
        />
      </div>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[100] bg-white p-4 md:hidden"
          >
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="relative flex-1">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Bạn cần tìm gì?"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm outline-none focus:border-primary focus:bg-white"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={20} />
                </button>
              </form>
              <button 
                onClick={() => setIsSearchOpen(false)} 
                className="text-sm font-bold text-slate-500"
              >
                Đóng
              </button>
            </div>

            <div className="mt-6">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Gợi ý tìm kiếm</h4>
              <SearchSuggestions
                suggestions={suggestions}
                isOpen={true}
                isLoading={isSearching}
                searchQuery={searchQuery}
                onClose={() => setIsSearchOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
