"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProductService } from "@/services/productService";
import { ProductWithDetails } from "@/types/database";
import Link from "next/link";
import { Edit, Trash2, Plus, Package, ExternalLink } from "lucide-react";
import { ProductImage } from "@/components/common/ProductImage";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const supabase = createClient();
    if (supabase) {
      const data = await ProductService.getProducts(supabase);
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;

    const supabase = createClient();
    if (supabase) {
      const { error } = await ProductService.deleteProduct(supabase, id);
      if (error) {
        alert("Lỗi khi xóa: " + error.message);
      } else {
        alert("Xóa thành công!");
        fetchProducts();
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-400 font-bold animate-pulse text-[14px]">Đang tải danh sách sản phẩm...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section with theme styles */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">
            Quản lý <span className="text-primary italic">Sản phẩm</span>
          </h1>
          <p className="text-slate-500 text-[14px] font-medium mt-1">
            Tổng cộng: <span className="text-primary font-black">{products.length}</span> sản phẩm trong kho.
          </p>
        </div>
      </header>

      {/* Table Section as a Bento Card */}
      <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Sản phẩm</th>
                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Danh mục & Thương hiệu</th>
                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Giá bán</th>
                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Tồn kho</th>
                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-all group">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5 border border-slate-100 transition-transform group-hover:scale-110 duration-500">
                        <ProductImage
                          src={p.image_url}
                          alt={p.name}
                          width={56}
                          height={56}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-[15px] leading-tight mb-1">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter opacity-60">ID: {p.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-col gap-1.5">
                      <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-500 text-[10px] font-black uppercase tracking-wider">
                        {p.categories?.name || "N/A"}
                      </span>
                      <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                        {p.brands?.name || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <p className="text-red-500 font-black text-[16px] tracking-tight">{p.price.toLocaleString("vi-VN")}₫</p>
                    {p.has_installment_0 && (
                      <span className="text-[9px] text-blue-500 font-black uppercase tracking-tighter">Trả góp 0%</span>
                    )}
                  </td>
                  <td className="py-5 px-6 text-center">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-[14px] ${p.stock_quantity > 10 ? "bg-slate-50 text-slate-600" : "bg-orange-50 text-orange-500"
                      }`}>
                      {p.stock_quantity}
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition-all transform hover:scale-110"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id!, p.name)}
                        className="p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all transform hover:scale-110"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <Package size={40} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-black text-[16px]">Chưa có sản phẩm nào trong hệ thống</p>
            <p className="text-slate-300 text-[13px] mt-2 font-medium">Bắt đầu bằng cách thêm sản phẩm đầu tiên của bạn</p>
          </div>
        )}
      </div>

      {/* Prominent CTA Button at the bottom as requested */}
      <div className="flex justify-center pt-8 pb-12">
        <Link
          href="/admin/products/new"
          className="group relative flex items-center gap-3 bg-primary text-white pl-8 pr-10 py-5 rounded-full font-black text-[16px] uppercase tracking-[0.1em] transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(190,24,93,0.3)] hover:shadow-[0_25px_50px_rgba(190,24,93,0.4)]"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:rotate-90">
            <Plus size={20} />
          </div>
          Thêm sản phẩm mới
          {/* Subtle decoration to match Modern SaaS vibe */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
        </Link>
      </div>
    </div>
  );
}
