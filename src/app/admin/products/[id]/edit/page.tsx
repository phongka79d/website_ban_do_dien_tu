"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ProductService } from "@/services/productService";
import { Product } from "@/types/database";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const supabase = createClient();
      if (supabase && id) {
        const data = await ProductService.getProductById(supabase, id as string);
        setProduct(data as any);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-8 text-center animate-pulse text-slate-400">Đang tải thông tin sản phẩm...</div>;
  if (!product) return <div className="p-8 text-center text-red-500 font-bold">Không tìm thấy sản phẩm!</div>;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">
          Chỉnh sửa <span className="text-primary italic">Sản phẩm</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          ID: <span className="font-mono text-[10px] text-slate-400 uppercase tracking-tighter">{product.id}</span>
        </p>
      </header>

      <ProductForm initialData={product} />
    </div>
  );
}
