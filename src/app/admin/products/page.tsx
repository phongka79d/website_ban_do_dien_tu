"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProductService } from "@/services/productService";
import { ProductWithDetails } from "@/types/database";
import Link from "next/link";
import { Edit, Trash2, Plus, Package, Search, Eye } from "lucide-react";
import { ProductImage } from "@/components/common/ProductImage";
import { Button } from "@/components/ui/Button";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import NotificationModal from "@/components/common/NotificationModal";
import { useAdminSearch } from "@/hooks/useAdminSearch";
import { Pagination } from "@/components/ui/Pagination";

export default function AdminProductsPage() {
  const searchFn = useCallback((supabase: any, query: string, page: number, pageSize: number) => 
    ProductService.searchProducts(supabase, query, page, pageSize), []);

  const {
    searchTerm,
    setSearchTerm,
    results: products,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    refresh: fetchProducts
  } = useAdminSearch<ProductWithDetails>({
    searchFn,
    initialPageSize: 20,
    storageKey: "admin-products-pageSize"
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string; imageUrl?: string | null } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const handleDeleteClick = (id: string, name: string, imageUrl?: string | null) => {
    setProductToDelete({ id, name, imageUrl });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    const supabase = createClient();
    if (supabase) {
      const { success, type, error } = await ProductService.safeDeleteProduct(supabase, productToDelete.id);
      
      if (!success) {
        setNotification({
          isOpen: true,
          title: "Lỗi xử lý",
          message: error?.message || "Không thể thực hiện hành động này.",
          type: "error",
        });
      } else {
        // --- Cloudinary Cleanup ONLY for Hard Delete ---
        if (type === 'hard' && productToDelete.imageUrl && !productToDelete.imageUrl.startsWith("http") && !productToDelete.imageUrl.startsWith("/")) {
          fetch("/api/cloudinary/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicIds: [productToDelete.imageUrl] }),
          }).catch(err => console.error("Cloudinary Cleanup failed:", err));
        }
        
        const successMessage = type === 'hard' 
          ? `Đã xóa vĩnh viễn sản phẩm "${productToDelete.name}"` 
          : `Sản phẩm "${productToDelete.name}" đã được ẩn đi để bảo vệ dữ liệu đơn hàng.`;

        setNotification({
          isOpen: true,
          title: "Thành công",
          message: successMessage,
          type: "success",
        });
        fetchProducts();
      }
    }
    setIsDeleting(false);
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleReactivate = async (id: string, name: string) => {
    setIsDeleting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = await ProductService.reactivateProduct(supabase, id);
      if (error) {
        setNotification({
          isOpen: true,
          title: "Lỗi phục hồi",
          message: error.message,
          type: "error",
        });
      } else {
        setNotification({
          isOpen: true,
          title: "Thành công",
          message: `Đã hiển thị lại sản phẩm "${name}"`,
          type: "success",
        });
        fetchProducts();
      }
    }
    setIsDeleting(false);
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
      <header className="flex flex-col gap-6">
        <div>
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">
            Quản lý <span className="text-primary italic">Sản phẩm</span>
          </h1>
          <p className="text-slate-500 text-[14px] font-medium mt-1">
            Tổng cộng: <span className="text-primary font-black">{totalCount}</span> sản phẩm trong kho.
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

          <Button
            as={Link}
            href="/admin/products/new"
            leftIcon={<Plus size={18} />}
            className="w-full md:w-auto h-12 rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-primary/20 text-[13px]"
          >
            Thêm sản phẩm mới
          </Button>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <div key={p.id} className="group bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden flex flex-col">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[40px] -z-0 group-hover:bg-primary/5 transition-colors"></div>

            <div className="relative z-10 flex flex-col h-full">
              {/* Product Image Holder */}
              <div className="relative aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center p-2 mb-4 border border-slate-100 transition-transform group-hover:scale-105 duration-500 relative">
                <ProductImage
                  src={p.image_url}
                  alt={p.name}
                  width={200}
                  height={200}
                  className="object-contain w-full h-full"
                />
                {!p.is_active && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-xl">
                      Đã vô hiệu hóa
                    </span>
                  </div>
                )}
                {p.is_active && p.stock_quantity <= 10 && (
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
              <div className="flex gap-2 mt-auto">
                <Button
                  as={Link}
                  href={`/admin/products/${p.id}/edit`}
                  variant="ghost"
                  size="sm"
                  leftIcon={<Edit size={14} />}
                  className="flex-1 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 rounded-xl h-9"
                >
                  SỬA
                </Button>
                
                {!p.is_active ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReactivate(p.id!, p.name)}
                    className="w-12 bg-emerald-50 text-emerald-500 hover:bg-emerald-100 rounded-xl h-9 flex items-center justify-center p-0"
                  >
                    <Eye size={14} />
                  </Button>
                ) : null}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(p.id!, p.name, p.image_url)}
                  className="w-12 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl h-9 flex items-center justify-center p-0"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalPages={totalPages}
        totalCount={totalCount}
        className="mt-8"
      />

      {/* Empty State */}
      {products.length === 0 && (
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

