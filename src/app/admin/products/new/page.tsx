"use client";

import React from "react";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";

export default function AddProductPage() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          <Link href="/admin/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
          <span>/</span>
          <span className="text-slate-900">Thêm mới</span>
        </div>
        <h1 className="text-[32px] font-black text-slate-900 tracking-tight">
          Tạo <span className="text-primary italic">Sản phẩm mới</span>
        </h1>
      </header>

      <ProductForm />
    </div>
  );
}
