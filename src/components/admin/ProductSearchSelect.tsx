"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, Package, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ProductService } from "@/services/productService";
import { ProductWithDetails } from "@/types/database";
import { cn } from "@/utils/cn";
import { ProductImage } from "../common/ProductImage";
import { useAdminSearch } from "@/hooks/useAdminSearch";

interface ProductSearchSelectProps {
  label: string;
  onSelect: (product: ProductWithDetails | null) => void;
  initialValue?: string; // id
  error?: string;
}

export function ProductSearchSelect({ label, onSelect, initialValue, error }: ProductSearchSelectProps) {
  const [selectedValue, setSelectedValue] = useState<ProductWithDetails | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchFn = useCallback((supabase: any, query: string, limit: number) => 
    ProductService.searchProducts(supabase, query, limit), []);

  const {
    searchTerm,
    setSearchTerm,
    results: filteredProducts,
    loading
  } = useAdminSearch<ProductWithDetails>({
    searchFn,
    initialLimit: 5,
    searchLimit: 10
  });

  // Fetch initial product if ID is provided
  useEffect(() => {
    if (initialValue && !selectedValue) {
      const fetchInitial = async () => {
        const supabase = createClient();
        if (supabase) {
          const product = await ProductService.getProductById(supabase, initialValue);
          if (product) {
            setSelectedValue(product as ProductWithDetails);
            setSearchTerm(product.name);
          }
        }
      };
      fetchInitial();
    }
  }, [initialValue, selectedValue, setSearchTerm]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (product: ProductWithDetails) => {
    setSelectedValue(product);
    setSearchTerm(product.name);
    onSelect(product);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedValue(null);
    setSearchTerm("");
    onSelect(null);
  };

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
          {label}
        </label>
        {error && (
          <span className="text-[10px] font-bold text-rose-500 animate-in fade-in slide-in-from-right-2 duration-300">
            {error}
          </span>
        )}
      </div>

      <div className="relative group">
        <div className={cn(
          "flex items-center gap-3 w-full p-4 rounded-2xl border transition-all duration-300",
          error ? "border-rose-200 bg-rose-50/30" : "border-slate-100 bg-slate-50/50 group-focus-within:border-primary group-focus-within:bg-white"
        )}>
          <Search size={18} className={cn("text-slate-400 transition-colors", isOpen && "text-primary")} />
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-[14px] font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
            placeholder="Tìm kiếm sản phẩm theo tên hoặc thương hiệu..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
          {selectedValue && (
            <button 
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-all"
            >
              <X size={16} />
            </button>
          )}
          {loading && <Loader2 size={16} className="animate-spin text-primary" />}
        </div>

        {/* Dropdown Results */}
        {isOpen && (filteredProducts.length > 0 || searchTerm) && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 max-h-[300px] overflow-y-auto no-scrollbar">
            {filteredProducts.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelect(product)}
                    className={cn(
                    "flex items-center gap-3 w-full p-3 rounded-2xl transition-all text-left group/item",
                    selectedValue?.id === product.id ? "bg-primary/10" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                      <ProductImage 
                        src={product.image_url} 
                        alt={product.name} 
                        width={40} 
                        height={40} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[13px] font-black text-slate-700 line-clamp-1 group-hover/item:text-primary transition-colors">
                        {product.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {product.brands?.name} • {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-slate-50 text-slate-300">
                  <Search size={24} />
                </div>
                <p className="text-[12px] font-bold text-slate-400">Không tìm thấy sản phẩm nào phù hợp</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
