"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProductService } from "@/services/productService";
import { Brand } from "@/types/database";
import { Plus, Edit, Trash2, Tags, Search, X } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import NotificationModal from "@/components/common/NotificationModal";
import { AdminInput } from "./AdminInput";
import { ProductImage } from "@/components/common/ProductImage";

export default function BrandManager() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<Partial<Brand> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const fetchBrands = async () => {
    setLoading(true);
    const supabase = createClient();
    if (supabase) {
      const data = await ProductService.getBrands(supabase);
      setBrands(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreate = () => {
    setCurrentBrand({ name: "", logo_url: "" });
    setIsEditModalOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setCurrentBrand(brand);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (brand: Brand) => {
    setCurrentBrand(brand);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBrand?.name) return;

    setIsSubmitting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = currentBrand.id
        ? await ProductService.updateBrand(supabase, currentBrand.id, currentBrand)
        : await ProductService.createBrand(supabase, currentBrand);

      if (error) {
        setNotification({
          isOpen: true,
          title: "Lỗi",
          message: error.message,
          type: "error",
        });
      } else {
        setNotification({
          isOpen: true,
          title: "Thành công",
          message: currentBrand.id ? "Cập nhật thương hiệu thành công" : "Thêm thương hiệu thành công",
          type: "success",
        });
        setIsEditModalOpen(false);
        fetchBrands();
      }
    }
    setIsSubmitting(false);
  };

  const confirmDelete = async () => {
    if (!currentBrand?.id) return;

    setIsSubmitting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = await ProductService.deleteBrand(supabase, currentBrand.id);
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
          message: "Đã xóa thương hiệu thành công",
          type: "success",
        });
        setIsDeleteModalOpen(false);
        fetchBrands();
      }
    }
    setIsSubmitting(false);
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm thương hiệu..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-100 bg-white shadow-sm focus:border-primary outline-none transition-all placeholder:text-slate-300 font-bold text-[14px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button
          onClick={handleCreate}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-[13px] cursor-pointer"
        >
          <Plus size={18} />
          Thêm thương hiệu
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBrands.map((brand) => (
            <div key={brand.id} className="group bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[40px] -z-0 group-hover:bg-primary/5 transition-colors"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden mb-4 group-hover:shadow-lg group-hover:border-primary/20 transition-all">
                  {brand.logo_url ? (
                    <ProductImage src={brand.logo_url} alt={brand.name} width={64} height={64} className="object-contain p-2" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                      <span className="font-black text-2xl uppercase">{brand.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                
                <h3 className="font-black text-slate-800 text-[18px] mb-1 group-hover:text-primary transition-colors">{brand.name}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    ID: {brand.id.slice(0, 4)}...{brand.id.slice(-4)}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all font-bold text-[12px] cursor-pointer"
                  >
                    <Edit size={14} /> Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteClick(brand)}
                    className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && filteredBrands.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400 font-bold">Không tìm thấy thương hiệu nào</p>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[40px] p-10 shadow-2xl animate-in zoom-in duration-300 border border-white">
            <button
               onClick={() => setIsEditModalOpen(false)}
               className="absolute right-8 top-8 text-slate-300 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">
              {currentBrand?.id ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <AdminInput
                label="Tên thương hiệu"
                required
                value={currentBrand?.name || ""}
                onChange={(e) => setCurrentBrand({ ...currentBrand, name: e.target.value })}
                placeholder="Ví dụ: Apple, Samsung..."
              />
              <AdminInput
                label="Logo URL (Cloudinary ID hoặc Link)"
                value={currentBrand?.logo_url || ""}
                onChange={(e) => setCurrentBrand({ ...currentBrand, logo_url: e.target.value })}
                placeholder="Ví dụ: apple_logo_id"
              />
              
              {currentBrand?.logo_url && (
                <div className="mt-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <ProductImage src={currentBrand.logo_url} alt="Preview" width={100} height={100} className="object-contain" />
                </div>
              )}

              <div className="pt-4">
                <button
                  disabled={isSubmitting}
                  className="w-full py-5 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.01] active:scale-95 disabled:grayscale transition-all cursor-pointer uppercase tracking-widest"
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa thương hiệu"
        message={`Bạn có chắc chắn muốn xóa thương hiệu "${currentBrand?.name}"? Các sản phẩm thuộc thương hiệu này có thể bị ảnh hưởng.`}
        confirmText="Xác nhận xóa"
        type="danger"
        loading={isSubmitting}
      />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
