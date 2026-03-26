"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product, Brand, Category } from "@/types/database";
import { ProductService } from "@/services/productService";
import { createClient } from "@/utils/supabase/client";

export function useProductForm(initialData?: Product) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const initialSpecs = initialData?.specs
    ? Object.entries(initialData.specs).map(([key, value]) => ({
        key,
        value: String(value),
      }))
    : [{ key: "", value: "" }];

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price?.toString() || "",
    original_price: initialData?.original_price?.toString() || "",
    promotion_text: initialData?.promotion_text || "",
    category_slug: initialData?.category_slug || "",
    brand_id: initialData?.brand_id || "",
    stock_quantity: initialData?.stock_quantity?.toString() || "0",
    has_installment_0: initialData?.has_installment_0 || false,
    specs: initialSpecs,
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      if (supabase) {
        const [brandData, categoryData] = await Promise.all([
          ProductService.getBrands(supabase),
          ProductService.getCategories(supabase),
        ]);
        setBrands(brandData);
        setCategories(categoryData);
        
        // Only set defaults if not in edit mode
        if (!initialData) {
          setFormData((prev) => ({
            ...prev,
            brand_id: brandData[0]?.id || "",
            category_slug: categoryData[0]?.slug || "",
          }));
        }
      }
    };
    fetchData();
  }, [initialData]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSpec = (index: number, field: "key" | "value", value: string) => {
    const newSpecs = [...formData.specs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setFormData((prev) => ({ ...prev, specs: newSpecs }));
  };

  const addSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specs: [...prev.specs, { key: "", value: "" }],
    }));
  };

  const removeSpec = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      alert("Cấu hình Supabase chưa hoàn thiện!");
      setLoading(false);
      return;
    }

    try {
      const specsObject = formData.specs.reduce((acc: any, spec) => {
        if (spec.key.trim()) acc[spec.key.trim()] = spec.value;
        return acc;
      }, {});

      const payload = {
        ...formData,
        price: Number(formData.price),
        original_price: formData.original_price
          ? Number(formData.original_price)
          : null,
        stock_quantity: Number(formData.stock_quantity),
        specs: specsObject,
        image_url: imageUrl,
      };

      const { error } = initialData
        ? await ProductService.updateProduct(
            supabase,
            initialData.id,
            payload as any
          )
        : await ProductService.createProduct(supabase, payload as any);

      if (error) throw error;
      alert(
        initialData
          ? "Cập nhật sản phẩm thành công!"
          : "Thêm sản phẩm thành công!"
      );
      router.push("/admin/products");
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
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
    isEdit: !!initialData,
  };
}
