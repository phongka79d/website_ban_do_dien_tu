"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProductService } from "@/services/productService";
import { Category } from "@/types/database";
import { Edit, Trash2, Tags, Grid, Eye } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import NotificationModal from "@/components/common/NotificationModal";
import { AdminInput } from "./AdminInput";
import { ImageUpload } from "./ImageUpload";
import { ProductImage } from "@/components/common/ProductImage";
import AdminManagerShell from "./AdminManagerShell";
import AdminActionModal from "./AdminActionModal";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryFormData } from "@/lib/validations/category";

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notification, setNotification] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error";
  }>({ isOpen: false, title: "", message: "", type: "success" });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const fetchCategories = async () => {
    setLoading(true);
    const supabase = createClient();
    if (supabase) {
      // Admin sees ALL categories
      const data = await ProductService.getCategories(supabase, false);
      setCategories(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = () => {
    reset({ name: "", slug: "", description: "", image_url: "" });
    setCurrentCategory(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image_url: category.image_url || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };

  const onSave = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = currentCategory?.id
        ? await ProductService.updateCategory(supabase, currentCategory.id, data)
        : await ProductService.createCategory(supabase, data);

      if (error) {
        setNotification({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
      } else {
        setNotification({
          isOpen: true,
          title: "Thành công",
          message: currentCategory?.id ? "Cập nhật danh mục thành công" : "Thêm danh mục thành công",
          type: "success"
        });
        setIsEditModalOpen(false);
        fetchCategories();
      }
    }
    setIsSubmitting(false);
  };

  const handleReactivate = async (id: string, name: string, slug: string) => {
    setIsSubmitting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = await ProductService.reactivateCategory(supabase, id, slug);
      if (error) {
        setNotification({ isOpen: true, title: "Lỗi phục hồi", message: error.message, type: "error" });
      } else {
        setNotification({ isOpen: true, title: "Thành công", message: `Đã hiển thị lại danh mục "${name}" và toàn bộ sản phẩm liên quan`, type: "success" });
        fetchCategories();
      }
    }
    setIsSubmitting(false);
  };

  const confirmDelete = async () => {
    if (!currentCategory?.id || !currentCategory?.slug) return;
    setIsSubmitting(true);
    const supabase = createClient();
    if (supabase) {
      const { success, type, error } = await ProductService.safeDeleteCategory(supabase, currentCategory.id, currentCategory.slug);
      
      if (!success) {
        setNotification({ isOpen: true, title: "Lỗi xử lý", message: error?.message || "Không thể thực hiện hành động này.", type: "error" });
      } else {
        // --- Cloudinary Cleanup ONLY for Hard Delete ---
        if (type === 'hard') {
          const productImages = await ProductService.getProductImagesByCategorySlug(supabase, currentCategory.slug);
          const allCloudinaryImages = [...productImages];
          
          if (currentCategory.image_url && !currentCategory.image_url.startsWith("http") && !currentCategory.image_url.startsWith("/")) {
            allCloudinaryImages.push(currentCategory.image_url);
          }

          if (allCloudinaryImages.length > 0) {
            fetch("/api/cloudinary/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ publicIds: allCloudinaryImages }),
            }).catch(err => console.error("Cloudinary Bulk Cleanup failed:", err));
          }
        }

        const successMessage = type === 'hard' 
          ? "Đã xóa vĩnh viễn danh mục và dọn dẹp các sản phẩm liên quan." 
          : "Danh mục và các sản phẩm liên quan đã được ẩn đi để bảo vệ dữ liệu đơn hàng.";

        setNotification({ isOpen: true, title: "Thành công", message: successMessage, type: "success" });
        setIsDeleteModalOpen(false);
        fetchCategories();
      }
    }
    setIsSubmitting(false);
  };

  const categorySlug = watch("slug");
  const categoryImageUrl = watch("image_url");

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
                <div className="relative w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4 group-hover:bg-white group-hover:shadow-lg transition-all shadow-sm overflow-hidden border border-slate-100/50">
                  {category.image_url ? (
                    <ProductImage src={category.image_url} alt={category.name} width={80} height={80} className="object-contain p-2" />
                  ) : (
                    <Grid size={32} className="text-slate-300" />
                  )}
                  {!category.is_active && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-[8px] font-black text-white uppercase tracking-tighter">Đã ẩn</span>
                    </div>
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
                    variant="light"
                    radius="xl"
                    className="flex-1 py-2.5 text-[12px] h-auto"
                    onClick={() => handleEdit(category)}
                    leftIcon={<Edit size={14} />}
                  >
                    SỬA
                  </Button>
                  
                  {!category.is_active ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReactivate(category.id, category.name, category.slug)}
                      className="w-12 bg-emerald-50 text-emerald-500 hover:bg-emerald-100 rounded-xl h-auto py-2.5"
                    >
                      <Eye size={14} />
                    </Button>
                  ) : null}

                  <Button
                    variant="lightDanger"
                    radius="xl"
                    className="p-2.5 h-auto w-auto"
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
        <form onSubmit={handleSubmit(onSave)} className="space-y-6">
          <AdminInput 
            label="Tên danh mục" 
            required 
            {...register("name")} 
            error={errors.name?.message}
            placeholder="Ví dụ: Điện thoại" 
          />
          <AdminInput 
            label="Slug (Đường dẫn)" 
            required 
            {...register("slug")} 
            error={errors.slug?.message}
            placeholder="Ví dụ: dien-thoai" 
            onBlur={(e) => {
              const val = e.target.value.toLowerCase().replace(/\s+/g, '-');
              setValue("slug", val);
            }}
          />
          
          <div className="space-y-4">
            <ImageUpload 
              label="Hình ảnh Danh mục (Tải lên)"
              imageUrl={categoryImageUrl || ""}
              categoryFolder="web_ban_do_dien_tu/categories"
              onSuccess={(result) => setValue("image_url", (result.info as any).public_id)}
              onClose={() => {}}
              onRemove={() => setValue("image_url", "")}
            />
            {errors.image_url && <p className="text-[10px] font-bold text-rose-500">{errors.image_url.message}</p>}
            
            <div className="pt-2">
              <AdminInput 
                label="Hoặc dán Link ảnh thủ công" 
                {...register("image_url")}
                placeholder="Ví dụ: category_id hoặc https://..." 
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1">Mô tả</label>
              {errors.description && <span className="text-[10px] font-bold text-rose-500">{errors.description.message}</span>}
            </div>
            <textarea 
              className={`w-full p-4 rounded-2xl border ${errors.description ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 bg-slate-50/50'} focus:border-primary focus:bg-white outline-none transition-all font-bold text-[14px] min-h-[120px]`} 
              {...register("description")} 
              placeholder="Nhập mô tả cho danh mục..." 
            />
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


