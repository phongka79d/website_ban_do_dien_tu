"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProductService } from "@/services/productService";
import { Brand } from "@/types/database";
import { Edit, Trash2, Tags, Eye } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import NotificationModal from "@/components/common/NotificationModal";
import { AdminInput } from "./AdminInput";
import { ProductImage } from "@/components/common/ProductImage";
import { ImageUpload } from "./ImageUpload";
import AdminManagerShell from "./AdminManagerShell";
import AdminActionModal from "./AdminActionModal";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandSchema, BrandFormData } from "@/lib/validations/brand";
import { useAdminSearch } from "@/hooks/useAdminSearch";

export default function BrandManager() {
  const searchFn = useCallback((supabase: any, query: string, limit: number) => 
    ProductService.searchBrands(supabase, query, limit), []);

  const {
    searchTerm,
    setSearchTerm,
    results: brands,
    loading,
    refresh: fetchBrands
  } = useAdminSearch<Brand>({
    searchFn,
    initialLimit: 20,
    searchLimit: 20
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
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
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  });

  const handleCreate = () => {
    reset({ name: "", logo_url: "" });
    setCurrentBrand(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setCurrentBrand(brand);
    reset({
      name: brand.name,
      logo_url: brand.logo_url || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (brand: Brand) => {
    setCurrentBrand(brand);
    setIsDeleteModalOpen(true);
  };

  const handleReactivate = async (id: string, name: string) => {
    setIsSubmitting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = await ProductService.reactivateBrand(supabase, id);
      if (error) {
        setNotification({ isOpen: true, title: "Lỗi phục hồi", message: error.message, type: "error" });
      } else {
        setNotification({ isOpen: true, title: "Thành công", message: `Đã hiển thị lại thương hiệu "${name}"`, type: "success" });
        fetchBrands();
      }
    }
    setIsSubmitting(false);
  };

  const onSave = async (data: BrandFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = currentBrand?.id
        ? await ProductService.updateBrand(supabase, currentBrand.id, data)
        : await ProductService.createBrand(supabase, data);

      if (error) {
        setNotification({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
      } else {
        setNotification({
          isOpen: true,
          title: "Thành công",
          message: currentBrand?.id ? "Cập nhật thương hiệu thành công" : "Thêm thương hiệu thành công",
          type: "success"
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
      const { success, type, error } = await ProductService.safeDeleteBrand(supabase, currentBrand.id);
      
      if (!success) {
        setNotification({ isOpen: true, title: "Lỗi xử lý", message: error?.message || "Không thể thực hiện hành động này.", type: "error" });
      } else {
        // --- Cloudinary Cleanup ONLY for Hard Delete ---
        if (type === 'hard' && currentBrand.logo_url && !currentBrand.logo_url.startsWith("http") && !currentBrand.logo_url.startsWith("/")) {
          fetch("/api/cloudinary/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicIds: [currentBrand.logo_url] }),
          }).catch(err => console.error("Cloudinary Cleanup failed:", err));
        }

        const successMessage = type === 'hard' 
          ? "Đã xóa vĩnh viễn thương hiệu và các sản phẩm liên quan." 
          : "Thương hiệu và các sản phẩm liên quan đã được ẩn đi để bảo vệ dữ liệu đơn hàng.";

        setNotification({ isOpen: true, title: "Thành công", message: successMessage, type: "success" });
        setIsDeleteModalOpen(false);
        fetchBrands();
      }
    }
    setIsSubmitting(false);
  };

  const brandLogoUrl = watch("logo_url");

  return (
    <>
      <AdminManagerShell
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Tìm kiếm thương hiệu..."
        onAdd={handleCreate}
        addLabel="Thêm thương hiệu"
        loading={loading}
        isEmpty={brands.length === 0}
        emptyIcon={<Tags size={48} />}
        emptyText="Không tìm thấy thương hiệu nào"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <Card 
              key={brand.id} 
              variant="flat" 
              radius="xl" 
              hover="scale" 
              className="p-6 border-slate-100"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[40px] -z-0 group-hover:bg-primary/5 transition-colors" />
              <div className="relative z-10">
                <div className="relative w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden mb-4 group-hover:shadow-lg group-hover:border-primary/20 transition-all">
                  {brand.logo_url ? (
                    <ProductImage src={brand.logo_url} alt={brand.name} width={64} height={64} className="object-contain p-2" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                      <span className="font-black text-2xl uppercase">{brand.name.charAt(0)}</span>
                    </div>
                  )}
                  {!brand.is_active && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-[8px] font-black text-white uppercase tracking-tighter">Đã ẩn</span>
                    </div>
                  )}
                </div>
                <h3 className="font-black text-slate-800 text-[18px] mb-1 group-hover:text-primary transition-colors">{brand.name}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {brand.id.slice(0, 4)}...{brand.id.slice(-4)}</span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="light"
                    radius="xl"
                    className="flex-1 py-2.5 text-[12px] h-auto"
                    onClick={() => handleEdit(brand)}
                    leftIcon={<Edit size={14} />}
                  >
                    SỬA
                  </Button>
                  
                  {!brand.is_active ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReactivate(brand.id, brand.name)}
                      className="w-12 bg-emerald-50 text-emerald-500 hover:bg-emerald-100 rounded-xl h-auto py-2.5"
                    >
                      <Eye size={14} />
                    </Button>
                  ) : null}

                  <Button
                    variant="lightDanger"
                    radius="xl"
                    className="p-2.5 h-auto w-auto"
                    onClick={() => handleDeleteClick(brand)}
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
        title={currentBrand?.id ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}
      >
        <form onSubmit={handleSubmit(onSave)} className="space-y-6">
          <AdminInput 
            label="Tên thương hiệu" 
            required 
            {...register("name")} 
            error={errors.name?.message}
            placeholder="Ví dụ: Apple, Samsung..." 
          />
          
          <div className="space-y-4">
            <ImageUpload 
              label="Logo Thương hiệu (Tải lên)"
              imageUrl={brandLogoUrl || ""}
              categoryFolder="web_ban_do_dien_tu/brands"
              onSuccess={(result) => setValue("logo_url", (result.info as any).public_id)}
              onClose={() => {}}
              onRemove={() => setValue("logo_url", "")}
            />
            {errors.logo_url && <p className="text-[10px] font-bold text-rose-500">{errors.logo_url.message}</p>}
            
            <div className="pt-2">
              <AdminInput 
                label="Hoặc dán Link ảnh thủ công" 
                {...register("logo_url")}
                placeholder="Ví dụ: apple_logo_id hoặc https://..." 
              />
            </div>
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

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Xóa thương hiệu" message={`Bạn có chắc chắn muốn xóa thương hiệu "${currentBrand?.name}"? Các sản phẩm thuộc thương hiệu này có thể bị ảnh hưởng.`} confirmText="Xác nhận xóa" type="danger" loading={isSubmitting} />
      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} title={notification.title} message={notification.message} type={notification.type} />
    </>
  );
}


