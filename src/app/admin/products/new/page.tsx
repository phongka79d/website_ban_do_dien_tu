"use client";

import React from "react";
import ProductForm from "@/components/admin/ProductForm";

export default function AddProductPage() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">
          Thêm <span className="text-primary italic">Sản phẩm mới</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Vui lòng điền đầy đủ các thông tin theo thiết kế database.
        </p>
      </header>

      <ProductForm />
    </div>
  );
}
