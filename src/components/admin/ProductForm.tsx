"use client";

import React from "react";
import { Product } from "@/types/database";
import { AdminInput } from "./AdminInput";
import { AdminSelect } from "./AdminSelect";
import { AdminToggle } from "./AdminToggle";
import { SpecManager } from "./SpecManager";
import { ImageUpload } from "./ImageUpload";
import { useProductForm } from "@/hooks/useProductForm";

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <AdminInput
            label="Tên sản phẩm"
            required
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Ví dụ: iPhone 15 Pro Max"
          />
        </div>

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

        <AdminInput
          label="Giá bán (VNĐ)"
          required
          type="number"
          value={formData.price}
          onChange={(e) => updateField("price", e.target.value)}
          placeholder="29000000"
        />

        <AdminInput
          label="Giá gốc (nếu có)"
          type="number"
          value={formData.original_price}
          onChange={(e) => updateField("original_price", e.target.value)}
          placeholder="34000000"
        />

        <AdminInput
          label="Số lượng tồn kho"
          required
          type="number"
          value={formData.stock_quantity}
          onChange={(e) => updateField("stock_quantity", e.target.value)}
          placeholder="100"
        />

        <AdminToggle
          label="Hỗ trợ trả góp 0%"
          checked={formData.has_installment_0}
          onChange={(checked) => updateField("has_installment_0", checked)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Thông tin khuyến mãi</label>
        <textarea
          rows={2}
          placeholder="Ví dụ: Giảm ngay 1 triệu cho tân sinh viên..."
          className="w-full p-4 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all bg-slate-50/50 focus:bg-white text-[14px]"
          value={formData.promotion_text}
          onChange={(e) => updateField("promotion_text", e.target.value)}
        />
      </div>

      <SpecManager
        specs={formData.specs}
        onAdd={addSpec}
        onRemove={removeSpec}
        onUpdate={updateSpec}
      />

      <ImageUpload
        label="Hình ảnh sản phẩm"
        imageUrl={imageUrl}
        onSuccess={(result) => {
          setImageUrl(result.info.public_id);
          document.body.style.overflow = "auto";
        }}
        onClose={() => (document.body.style.overflow = "auto")}
        onRemove={() => setImageUrl("")}
      />

      <div className="pt-4">
        <button
          disabled={loading || !imageUrl}
          className="w-full py-5 rounded-2xl bg-primary text-white font-black text-xl shadow-2xl shadow-primary/40 hover:scale-[1.01] active:scale-95 disabled:grayscale disabled:scale-100 transition-all border-b-4 border-black/20 uppercase tracking-wider"
        >
          {loading ? "ĐANG XỬ LÝ..." : isEdit ? "LƯU THAY ĐỔI" : "XÁC NHẬN THÊM SẢN PHẨM"}
        </button>
      </div>
    </form>
  );
}
