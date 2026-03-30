"use client";

import React from "react";
import { useWishlistStore } from "@/store/useWishlistStore";
import ProductCard from "@/components/ProductCard";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function WishlistClient() {
  const { items, isLoading } = useWishlistStore();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="font-bold text-slate-500 text-lg uppercase tracking-widest animate-pulse">
          Đang tải danh sách yêu thích...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <Heart size={120} className="text-slate-100" />
            <ShoppingBag size={40} className="absolute bottom-0 right-0 text-primary" />
          </div>
        </motion.div>
        
        <h2 className="mb-4 text-3xl font-black text-slate-900">
          Danh sách yêu thích <span className="text-primary italic">trống</span>
        </h2>
        <p className="mb-10 text-slate-500 max-w-md mx-auto leading-relaxed">
          Hãy thêm những sản phẩm bạn yêu thích để dễ dàng theo dõi và mua sắm sau này nhé!
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-black text-white shadow-lg transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
        >
          <ShoppingBag size={20} />
          TIẾP TỤC MUA SẮM
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Quay lại cửa hàng
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Sản phẩm <span className="text-red-500 italic">Yêu thích</span>
          </h1>
          <p className="mt-2 text-slate-500">
            Bạn đang có <span className="font-bold text-red-500">{items.length}</span> sản phẩm trong danh sách.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          item.products && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              key={item.product_id}
            >
              <ProductCard product={item.products} />
            </motion.div>
          )
        ))}
      </div>
    </div>
  );
}
