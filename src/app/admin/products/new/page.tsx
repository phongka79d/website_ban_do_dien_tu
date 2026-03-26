"use client";

import React, { useState } from "react";
import { CldUploadWidget, CldImage } from "next-cloudinary";
import { ProductService } from "@/services/productService";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    original_price: "",
    promotion_text: "",
    category_slug: "laptop", // Default
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await ProductService.createProduct({
        ...formData,
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : null,
        image_url: imageUrl,
        brand_id: "7776b206-ba77-4467-8894-3746765037be", // Mocking brand for now
      } as any);

      if (error) throw error;
      
      alert("Thêm sản phẩm thành công!");
      router.push("/products");
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (result: any) => {
    setImageUrl(result.info.public_id);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <h1 className="text-3xl font-black text-slate-900 mb-8">
        Thêm <span className="text-primary italic">Sản phẩm mới</span>
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Tên sản phẩm</label>
            <input
              required
              type="text"
              placeholder="Ví dụ: iPhone 15 Pro Max"
              className="w-full p-4 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Danh mục</label>
            <select
              className="w-full p-4 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all"
              value={formData.category_slug}
              onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
            >
              <option value="laptop">Laptop</option>
              <option value="phone">Điện thoại</option>
              <option value="tablet">Máy tính bảng</option>
              <option value="audio">Âm thanh</option>
            </select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Giá bán (VNĐ)</label>
            <input
              required
              type="number"
              placeholder="29000000"
              className="w-full p-4 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          {/* Original Price */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Giá gốc (nếu có)</label>
            <input
              type="number"
              placeholder="34000000"
              className="w-full p-4 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all"
              value={formData.original_price}
              onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
            />
          </div>
        </div>

        {/* Promotion Text */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Thông tin khuyến mãi</label>
          <textarea
            rows={3}
            placeholder="Ví dụ: Giảm ngay 1 triệu cho tân sinh viên..."
            className="w-full p-4 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all"
            value={formData.promotion_text}
            onChange={(e) => setFormData({ ...formData, promotion_text: e.target.value })}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 block">Hình ảnh sản phẩm</label>
          
          {imageUrl ? (
            <div className="relative w-48 aspect-square rounded-2xl overflow-hidden border-2 border-primary shadow-lg group">
              <CldImage
                src={imageUrl}
                width={300}
                height={300}
                crop="fill"
                alt="Preview"
                className="object-cover w-full h-full"
              />
              <button 
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition-opacity"
              >
                Thay đổi
              </button>
            </div>
          ) : (
            <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} onSuccess={handleUpload}>
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="w-full py-10 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-medium hover:border-primary hover:text-primary transition-all flex flex-col items-center justify-center gap-2"
                >
                  <span className="text-3xl">+</span>
                  Tải ảnh lên từ Cloudinary
                </button>
              )}
            </CldUploadWidget>
          )}
        </div>

        {/* Submit */}
        <button
          disabled={loading || !imageUrl}
          className="w-full py-5 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 disabled:grayscale disabled:scale-100 transition-all"
        >
          {loading ? "Đang xử lý..." : "XÁC NHẬN THÊM SẢN PHẨM"}
        </button>
      </form>
    </div>
  );
}
