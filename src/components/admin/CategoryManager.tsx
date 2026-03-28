"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProductService } from "@/services/productService";
import { Category } from "@/types/database";
import { Edit, Trash2, Grid } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import NotificationModal from "@/components/common/NotificationModal";
import { AdminInput } from "./AdminInput";
import { ImageUpload } from "./ImageUpload";
import { ProductImage } from "@/components/common/ProductImage";
import AdminManagerShell from "./AdminManagerShell";
import AdminActionModal from "./AdminActionModal";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notification, setNotification] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error";
  }>({ isOpen: false, title: "", message: "", type: "success" });

  const fetchCategories = async () => {
    setLoading(true);
    const supabase = createClient();
    if (supabase) {
      const data = await ProductService.getCategories(supabase);
      setCategories(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = () => { setCurrentCategory({ name: "", slug: "", description: "", image_url: "" }); setIsEditModalOpen(true); };
  const handleEdit = (category: Category) => { setCurrentCategory(category); setIsEditModalOpen(true); };
  const handleDeleteClick = (category: Category) => { setCurrentCategory(category); setIsDeleteModalOpen(true); };

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
        setNotification({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
      } else {
        setNotification({ isOpen: true, title: "Thành công", message: currentCategory.id ? "Cập nhật danh mục thành công" : "Thêm danh mục thành công", type: "success" });
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
        setNotification({ isOpen: true, title: "Lỗi khi xóa", message: error.message, type: "error" });
      } else {
        setNotification({ isOpen: true, title: "Thành công", message: "Đã xóa danh mục thành công", type: "success" });
        setIsDeleteModalOpen(false);
        fetchCategories();
      }
    }
    setIsSubmitting(false);
  };

  const filteredCategories = categories.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <AdminManagerShell
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Tìm kiếm danh mục..."
        onAdd={handleCreate}
        addLabel="Thêm danh mục"
        loading={loading}
        isEmpty={filteredCategories.length === 0}
        emptyIcon={<Grid size={48} />}
        emptyText="Không tìm thấy danh mục nào"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Card 
              key={category.id} 
              variant="flat" 
              radius="xl" 
              hover="scale" 
              className="p-6 border-slate-100"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[40px] -z-0 group-hover:bg-primary/5 transition-colors" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4 group-hover:bg-white group-hover:shadow-lg transition-all shadow-sm overflow-hidden border border-slate-100/50">
                  {category.image_url ? (
                    <ProductImage src={category.image_url} alt={category.name} width={80} height={80} className="object-contain p-2" />
                  ) : (
                    <Grid size={32} className="text-slate-300" />
                  )}
                </div>
                <h3 className="font-black text-slate-800 text-[18px] mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{category.slug}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-50/50 text-[10px] font-bold text-slate-300 uppercase tracking-tighter">ID: {category.id.slice(0, 4)}...{category.id.slice(-4)}</span>
                </div>
                <p className="text-[13px] text-slate-500 line-clamp-2 min-h-[40px] font-medium leading-relaxed">{category.description || "Không có mô tả"}</p>
                <div className="flex gap-2 mt-6">
                  <Button 
                    variant="soft" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(category)}
                    leftIcon={<Edit size={14} />}
                  >
                    Sửa
                  </Button>
                  <Button 
                    variant="soft" 
                    size="sm" 
                    className="p-2.5 hover:bg-red-50 hover:text-red-500"
                    onClick={() => handleDeleteClick(category)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </AdminManagerShell>

      <AdminActionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={currentCategory?.id ? "Cập nhật danh mục" : "Thêm danh mục mới"}
      >
        <form onSubmit={handleSave} className="space-y-6">
          <AdminInput label="Tên danh mục" required value={currentCategory?.name || ""} onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })} placeholder="Ví dụ: Điện thoại" />
          <AdminInput label="Slug (Đường dẫn)" required value={currentCategory?.slug || ""} onChange={(e) => setCurrentCategory({ ...currentCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="Ví dụ: dien-thoai" />
          
          <div className="space-y-4">
            <ImageUpload 
              label="Hình ảnh Danh mục (Tải lên)"
              imageUrl={currentCategory?.image_url || ""}
              categoryFolder="web_ban_do_dien_tu/categories"
              onSuccess={(result) => setCurrentCategory({ ...currentCategory, image_url: (result.info as any).public_id })}
              onClose={() => {}}
              onRemove={() => setCurrentCategory({ ...currentCategory, image_url: "" })}
            />
            
            <div className="pt-2">
              <AdminInput 
                label="Hoặc dán Link ảnh thủ công" 
                value={currentCategory?.image_url || ""} 
                onChange={(e) => setCurrentCategory({ ...currentCategory, image_url: e.target.value })} 
                placeholder="Ví dụ: category_id hoặc https://..." 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1">Mô tả</label>
            <textarea className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:border-primary focus:bg-white outline-none transition-all font-bold text-[14px] min-h-[120px]" value={currentCategory?.description || ""} onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })} placeholder="Nhập mô tả cho danh mục..." />
          </div>
          <div className="pt-4">
            <Button 
              type="submit" 
              isLoading={isSubmitting} 
              fullWidth 
              size="lg"
            >
              Xác nhận lưu
            </Button>
          </div>
        </form>
      </AdminActionModal>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Xóa danh mục" message={`Bạn có chắc chắn muốn xóa danh mục "${currentCategory?.name}"? Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.`} confirmText="Xác nhận xóa" type="danger" loading={isSubmitting} />
      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} title={notification.title} message={notification.message} type={notification.type} />
    </>
  );
}
