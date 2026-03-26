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

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const {
    formData,
    loading,
    imageUrl,
    setImageUrl,
    brands,
    categories,
    updateField,
    updateSpec,
    addSpec,
    removeSpec,
    handleSubmit,
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmSaveOpen(true);
  };

  const executeSubmit = async () => {
    setConfirmSaveOpen(false);
    const result = await handleSubmit();
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
        {/* Row 1: Information & Settings */}
        <div className="col-span-12 lg:col-span-8">
          <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[2px_10px_30px_rgb(0,0,0,0.02)] relative overflow-hidden h-full flex flex-col">
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
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Ví dụ: iPhone 15 Pro Max"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AdminInput
                    label="Giá bán (VNĐ)"
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    placeholder="29000000"
                  />
                  <AdminInput
                    label="Giá gốc"
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => updateField("original_price", e.target.value)}
                    placeholder="34000000"
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Khuyến mãi / Tóm tắt</label>
                  <textarea
                    rows={3}
                    placeholder="Giảm giá mạnh tay..."
                    className="w-full p-4 rounded-2xl border border-slate-100 focus:border-primary outline-none transition-all bg-slate-50/50 focus:bg-white text-[14px] font-medium"
                    value={formData.promotion_text}
                    onChange={(e) => updateField("promotion_text", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 h-full">
          <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-full relative overflow-hidden">
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
                  value={formData.category_slug}
                  onChange={(e) => updateField("category_slug", e.target.value)}
                  options={categories.map((c) => ({ value: c.slug, label: c.name }))}
                />
                <AdminSelect
                  label="Thương hiệu"
                  required
                  value={formData.brand_id}
                  onChange={(e) => updateField("brand_id", e.target.value)}
                  options={brands.map((b) => ({ value: b.id, label: b.name }))}
                />
                <div className="p-5 rounded-[24px] bg-slate-50/50 border border-slate-100 space-y-5 mt-2">
                  <AdminInput
                    label="Số lượng tồn kho"
                    required
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => updateField("stock_quantity", e.target.value)}
                  />
                  <AdminToggle
                    label="Hỗ trợ trả góp 0%"
                    checked={formData.has_installment_0}
                    onChange={(checked) => updateField("has_installment_0", checked)}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Row 2: Specs & Media/Submit */}
        <div className="col-span-12 lg:col-span-8">
          <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[2px_10px_30px_rgb(0,0,0,0.02)] h-full flex flex-col relative">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
              Thông số kỹ thuật
            </h2>
            <div className="grow">
              <SpecManager
                specs={formData.specs}
                onAdd={addSpec}
                onRemove={removeSpec}
                onUpdate={updateSpec}
              />
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[40px] -z-0"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                <span className="w-2 h-6 bg-primary rounded-full"></span>
                Hình ảnh
              </h2>
              <ImageUpload
                label="Chọn ảnh chính"
                imageUrl={imageUrl}
                onSuccess={(result) => {
                  setImageUrl(result.info.public_id);
                  document.body.style.overflow = "auto";
                }}
                onClose={() => (document.body.style.overflow = "auto")}
                onRemove={() => setImageUrl("")}
              />
            </div>
          </section>

          <div className="bg-white/50 backdrop-blur-xl p-2 rounded-[28px] border border-white shadow-xl">
            <button
              disabled={loading || !imageUrl}
              className="w-full py-5 rounded-2xl bg-primary text-white font-black text-[15px] shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 disabled:grayscale transition-all uppercase tracking-[2px] cursor-pointer"
            >
              {loading ? "ĐANG LƯU..." : isEdit ? "LƯU THAY ĐỔI" : "TẠO SẢN PHẨM"}
            </button>
            <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4 opacity-40">
              Vui lòng kiểm tra kỹ trước khi xác nhận
            </p>
          </div>
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
