"use client";

import React, { useState } from "react";
import { Product } from "@/types/database";
import { AdminInput } from "./AdminInput";
import { AdminSelect } from "./AdminSelect";
import { AdminToggle } from "./AdminToggle";
import { SpecManager } from "./SpecManager";
import { ImageUpload } from "./ImageUpload";
import { useProductForm } from "@/hooks/useProductForm";
import NotificationModal from "@/components/common/NotificationModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import RichTextEditor from "./RichTextEditor";
import { ProductFormData } from "@/lib/validations/product";

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    onSubmit,
    setValue,
    watch,
    errors,
    loading,
    imageUrl,
    brands,
    categories,
    formData,
    isEdit,
  } = useProductForm(initialData);

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

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [pendingData, setPendingData] = useState<ProductFormData | null>(null);

  const handleFormSubmit = handleSubmit(
    (data) => {
      // Nếu validation thành công, lưu lại data tạm thời và mở modal xác nhận
      setPendingData(data as any);
      setConfirmSaveOpen(true);
    },
    (invalidErrors) => {
      setNotification({
        isOpen: true,
        title: "Dữ liệu không hợp lệ",
        message: "Vui lòng kiểm tra lại các trường thông tin có màu đỏ.",
        type: "error",
      });
    }
  );

  const executeSubmit = async () => {
    if (!pendingData) return;
    setConfirmSaveOpen(false);
    
    // Gọi API xử lý update / create
    const result = await onSubmit(pendingData);
    if (result) {
      setNotification({
        isOpen: true,
        title: result.success ? "Thành công!" : "Có lỗi xảy ra",
        message: result.message,
        type: result.success ? "success" : "error",
      });
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <form onSubmit={handleFormSubmit} className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-12 lg:col-span-8">
          <Card variant="elevated" radius="2xl" className="p-8 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[60px] -z-0"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                <span className="w-2 h-6 bg-primary rounded-full"></span>
                Thông tin chung
              </h2>
              <div className="space-y-6">
                <AdminInput
                  label="Tên sản phẩm"
                  required
                  {...register("name")}
                  error={errors.name?.message}
                  placeholder="Ví dụ: iPhone 15 Pro Max"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AdminInput
                    label="Giá bán (VNĐ)"
                    required
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    error={errors.price?.message}
                    placeholder="29000000"
                  />
                  <AdminInput
                    label="Giá gốc"
                    type="number"
                    {...register("original_price", { valueAsNumber: true })}
                    error={errors.original_price?.message}
                    placeholder="34000000"
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Khuyến mãi / Tóm tắt</label>
                    {errors.promotion_text && (
                      <span className="text-[10px] font-bold text-rose-500">{errors.promotion_text.message}</span>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Giảm giá mạnh tay..."
                    className={`w-full p-4 rounded-2xl border ${
                      errors.promotion_text ? "border-rose-200 bg-rose-50/30" : "border-slate-100 bg-slate-50/50"
                    } focus:border-primary outline-none transition-all focus:bg-white text-[14px] font-medium`}
                    {...register("promotion_text")}
                  />
                </div>
                <RichTextEditor
                  label="Mô tả chi tiết sản phẩm (Description)"
                  value={formData.description || ""}
                  onChange={(content) => setValue("description", content)}
                />
                {errors.description && (
                  <p className="text-[10px] font-bold text-rose-500 mt-2">{errors.description.message}</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 h-full">
          <Card variant="elevated" radius="2xl" className="p-8 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[40px] -z-0"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                <span className="w-2 h-6 bg-primary rounded-full"></span>
                Thiết lập
              </h2>
              <div className="space-y-6">
                <AdminSelect
                  label="Danh mục"
                  required
                  {...register("category_slug")}
                  error={errors.category_slug?.message}
                  options={categories.map((c) => ({ value: c.slug, label: c.name }))}
                />
                <AdminSelect
                  label="Thương hiệu"
                  required
                  {...register("brand_id")}
                  error={errors.brand_id?.message}
                  options={brands.map((b) => ({ value: b.id, label: b.name }))}
                />
                <div className="p-5 rounded-[24px] bg-slate-50/50 border border-slate-100 space-y-5 mt-2">
                  <AdminInput
                    label="Số lượng tồn kho"
                    required
                    type="number"
                    {...register("stock_quantity", { valueAsNumber: true })}
                    error={errors.stock_quantity?.message}
                  />
                  <AdminToggle
                    label="Hỗ trợ trả góp 0%"
                    checked={formData.has_installment_0}
                    onChange={(checked) => setValue("has_installment_0", checked)}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <Card variant="elevated" radius="2xl" className="p-8 h-full flex flex-col relative overflow-hidden">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
              Thông số kỹ thuật
            </h2>
            <div className="grow">
              <SpecManager
                specs={Object.entries(formData.specs || {}).map(([key, value]) => ({ key, value: String(value) }))}
                onAdd={() => {
                  const currentSpecs = { ...formData.specs };
                  currentSpecs[""] = "";
                  setValue("specs", currentSpecs);
                }}
                onRemove={(index) => {
                  const entries = Object.entries(formData.specs || {});
                  entries.splice(index, 1);
                  setValue("specs", Object.fromEntries(entries));
                }}
                onUpdate={(index, field, value) => {
                  const entries = Object.entries(formData.specs || {});
                  if (field === "key") {
                    const oldVal = entries[index][1];
                    entries[index] = [value, oldVal];
                  } else {
                    entries[index][1] = value;
                  }
                  setValue("specs", Object.fromEntries(entries));
                }}
              />
              {errors.specs && (
                <p className="text-[10px] font-bold text-rose-500 mt-4">
                  {typeof errors.specs.message === 'string' ? errors.specs.message : "Thông số kỹ thuật không hợp lệ"}
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card variant="elevated" radius="2xl" className="p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[40px] -z-0"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                <span className="w-2 h-6 bg-primary rounded-full"></span>
                Hình ảnh
              </h2>
              <ImageUpload
                label="Chọn ảnh chính"
                imageUrl={imageUrl}
                categoryFolder={formData.category_slug ? `web_ban_do_dien_tu/products/${formData.category_slug}` : "antigravity-store/products/uncategorized"}
                onSuccess={(result) => {
                  setValue("image_url", result.info.public_id);
                  document.body.style.overflow = "auto";
                }}
                onClose={() => (document.body.style.overflow = "auto")}
                onRemove={() => setValue("image_url", "")}
              />
              {errors.image_url && (
                <p className="text-[10px] font-bold text-rose-500 mt-2">{errors.image_url.message}</p>
              )}
            </div>
          </Card>

          <Card variant="glass" radius="xl" className="p-2 border-white shadow-xl">
            <Button
              type="submit"
              isLoading={loading}
              disabled={!imageUrl}
              fullWidth
              size="lg"
              className="py-5 text-[15px] tracking-[2px]"
            >
              {isEdit ? "LƯU THAY ĐỔI" : "TẠO SẢN PHẨM"}
            </Button>
            <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4 opacity-40">
              Vui lòng kiểm tra kỹ trước khi xác nhận
            </p>
          </Card>
        </div>
      </form>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => {
          setNotification((prev) => ({ ...prev, isOpen: false }));
          if (notification.type === "success") {
            router.push("/admin/products");
          }
        }}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        buttonText={notification.type === "success" ? "Về danh sách" : "Thử lại"}
      />

      <ConfirmationModal
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={executeSubmit}
        title={isEdit ? "Xác nhận cập nhật" : "Xác nhận thêm mới"}
        message={isEdit ? "Bạn có chắc chắn muốn lưu các thay đổi cho sản phẩm này?" : "Bạn có chắc chắn muốn thêm sản phẩm này vào hệ thống?"}
        confirmText="Xác nhận"
        type="info"
        loading={loading}
      />
    </div>
  );
}

