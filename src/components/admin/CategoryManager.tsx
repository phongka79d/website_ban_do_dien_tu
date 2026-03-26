"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProductService } from "@/services/productService";
import { Category } from "@/types/database";
import { Plus, Edit, Trash2, Grid, Search, X } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import NotificationModal from "@/components/common/NotificationModal";
import { AdminInput } from "./AdminInput";

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
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

  const fetchCategories = async () => {
    setLoading(true);
    const supabase = createClient();
    if (supabase) {
      const data = await ProductService.getCategories(supabase);
      setCategories(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = () => {
    setCurrentCategory({ name: "", slug: "", description: "" });
    setIsEditModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory?.name || !currentCategory?.slug) return;

    setIsSubmitting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = currentCategory.id
        ? await ProductService.updateCategory(supabase, currentCategory.id, currentCategory)
        : await ProductService.createCategory(supabase, currentCategory);

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
          message: currentCategory.id ? "Cập nhật danh mục thành công" : "Thêm danh mục thành công",
          type: "success",
        });
        setIsEditModalOpen(false);
        fetchCategories();
      }
    }
    setIsSubmitting(false);
  };

  const confirmDelete = async () => {
    if (!currentCategory?.id) return;

    setIsSubmitting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = await ProductService.deleteCategory(supabase, currentCategory.id);
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
          message: "Đã xóa danh mục thành công",
          type: "success",
        });
        setIsDeleteModalOpen(false);
        fetchCategories();
      }
    }
    setIsSubmitting(false);
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
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
          Thêm danh mục
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="group bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[40px] -z-0 group-hover:bg-primary/5 transition-colors"></div>

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-white group-hover:text-primary group-hover:shadow-lg transition-all shadow-sm">
                  <Grid size={24} />
                </div>

                <h3 className="font-black text-slate-800 text-[18px] mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {category.slug}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-50/50 text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                    ID: {category.id.slice(0, 4)}...{category.id.slice(-4)}
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 line-clamp-2 min-h-[40px] font-medium leading-relaxed">{category.description || "Không có mô tả"}</p>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all font-bold text-[12px] cursor-pointer"
                  >
                    <Edit size={14} /> Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category)}
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
      {!loading && filteredCategories.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400 font-bold">Không tìm thấy danh mục nào</p>
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
              {currentCategory?.id ? "Cập nhật danh mục" : "Thêm danh mục mới"}
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <AdminInput
                label="Tên danh mục"
                required
                value={currentCategory?.name || ""}
                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                placeholder="Ví dụ: Điện thoại"
              />
              <AdminInput
                label="Slug (Đường dẫn)"
                required
                value={currentCategory?.slug || ""}
                onChange={(e) => setCurrentCategory({ ...currentCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="Ví dụ: dien-thoai"
              />
              <div className="space-y-2">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1">Mô tả</label>
                <textarea
                  className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:border-primary focus:bg-white outline-none transition-all font-bold text-[14px] min-h-[120px]"
                  value={currentCategory?.description || ""}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                  placeholder="Nhập mô tả cho danh mục..."
                />
              </div>

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
        title="Xóa danh mục"
        message={`Bạn có chắc chắn muốn xóa danh mục "${currentCategory?.name}"? Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.`}
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
