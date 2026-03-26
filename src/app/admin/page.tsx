import React from "react";
import { ProductService } from "@/services/productService";
import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  if (!supabase) return null;

  const products = await ProductService.getProducts(supabase);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900">
          Bảng <span className="text-primary italic">Thống kê</span>
        </h1>
        <p className="text-slate-500">Tổng quan về cửa hàng của bạn.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-500 mb-1">Tổng sản phẩm</p>
          <p className="text-4xl font-black text-slate-900">{products.length}</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-500 mb-1">Thương hiệu</p>
          <p className="text-4xl font-black text-slate-900">4</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-500 mb-1">Lượt xem</p>
          <p className="text-4xl font-black text-slate-900">1.2K</p>
        </div>
      </div>

      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-4">Sản phẩm mới nhất</h2>
        <div className="divide-y divide-slate-100">
          {products.slice(0, 5).map((p) => (
            <div key={p.id} className="py-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">{p.name}</p>
                <p className="text-sm text-slate-500">{p.price.toLocaleString("vi-VN")}₫</p>
              </div>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                {p.category_slug}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
