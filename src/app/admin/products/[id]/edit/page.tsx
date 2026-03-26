"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ProductService } from "@/services/productService";
import { Product } from "@/types/database";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";

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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          <Link href="/admin/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
          <span>/</span>
          <span className="text-slate-900">Chỉnh sửa</span>
        </div>
        <h1 className="text-[32px] font-black text-slate-900 tracking-tight">
          Cập nhật <span className="text-primary italic">Sản phẩm</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-tighter opacity-60">
          ID: {product.id}
        </p>
      </header>

      <ProductForm initialData={product} />
    </div>
  );
}
