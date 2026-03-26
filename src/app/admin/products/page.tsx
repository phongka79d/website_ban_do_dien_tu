"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProductService } from "@/services/productService";
import { ProductWithDetails } from "@/types/database";
import Link from "next/link";
import { Edit, Trash2, Plus, Package, ExternalLink, Search } from "lucide-react";
import { ProductImage } from "@/components/common/ProductImage";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import NotificationModal from "@/components/common/NotificationModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

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

  const handleDeleteClick = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = await ProductService.deleteProduct(supabase, productToDelete.id);
      if (error) {
        setNotification({
          isOpen: true,
          title: "Lỗi khi xóa",
          message: error.message,
          type: "error",
        });
      } else {
        setNotification({
          isOpen: true,
          title: "Thành công",
          message: `Đã xóa sản phẩm "${productToDelete.name}"`,
          type: "success",
        });
        fetchProducts();
      }
    }
    setIsDeleting(false);
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-400 font-bold animate-pulse text-[14px]">Đang tải danh sách sản phẩm...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section with theme styles */}
      <header className="flex flex-col gap-6">
        <div>
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">
            Quản lý <span className="text-primary italic">Sản phẩm</span>
          </h1>
          <p className="text-slate-500 text-[14px] font-medium mt-1">
            Tổng cộng: <span className="text-primary font-black">{products.length}</span> sản phẩm trong kho.
          </p>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-white shadow-sm focus:border-primary outline-none transition-all placeholder:text-slate-300 font-bold text-[14px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link
            href="/admin/products/new"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-[13px] cursor-pointer"
          >
            <Plus size={18} />
            Thêm sản phẩm mới
          </Link>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div key={p.id} className="group bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden flex flex-col">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[40px] -z-0 group-hover:bg-primary/5 transition-colors"></div>

            <div className="relative z-10 flex flex-col h-full">
              {/* Product Image Holder */}
              <div className="aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center p-2 mb-4 border border-slate-100 transition-transform group-hover:scale-105 duration-500 relative">
                <ProductImage
                  src={p.image_url}
                  alt={p.name}
                  width={200}
                  height={200}
                  className="object-contain w-full h-full"
                />
                {p.stock_quantity <= 10 && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-orange-500 text-white text-[10px] font-black uppercase">
                    Sắp hết hàng
                  </div>
                )}
              </div>

              {/* Badges Container */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[9px] font-black text-indigo-500 uppercase tracking-wider">
                  {p.categories?.name || "N/A"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[9px] font-black text-slate-400 opacity-60 uppercase tracking-wider">
                  {p.brands?.name || "N/A"}
                </span>
              </div>

              {/* Title & Price */}
              <h3 className="font-bold text-slate-900 text-[15px] mb-2 line-clamp-2 leading-snug grow group-hover:text-primary transition-colors">
                {p.name}
              </h3>

              <div className="space-y-1 mb-4">
                <p className="text-red-500 font-black text-[18px] tracking-tight">
                  {p.price.toLocaleString("vi-VN")}₫
                </p>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-400">Kho: <span className={p.stock_quantity > 10 ? "text-slate-900" : "text-orange-500"}>{p.stock_quantity}</span></span>
                  <span className="text-slate-300 uppercase tracking-tighter text-[9px]">ID: {p.id.slice(0, 8)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition-all font-bold text-[12px] cursor-pointer"
                >
                  <Edit size={14} /> Sửa
                </Link>
                <button
                  onClick={() => handleDeleteClick(p.id!, p.name)}
                  className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="py-24 text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <Package size={40} className="text-slate-200" />
          </div>
          <p className="text-slate-400 font-black text-[18px]">Không tìm thấy sản phẩm</p>
          <button
            onClick={() => setSearchTerm("")}
            className="text-primary text-[14px] font-bold mt-2 hover:underline"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xác nhận xóa"
        type="danger"
        loading={isDeleting}
      />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}

