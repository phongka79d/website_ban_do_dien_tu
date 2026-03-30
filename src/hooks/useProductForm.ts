import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product, Brand, Category } from "@/types/database";
import { ProductService } from "@/services/productService";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormData } from "@/lib/validations/product";

export function useProductForm(initialData?: Product) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,

    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price || 0,
      original_price: initialData?.original_price || null,
      promotion_text: initialData?.promotion_text || "",
      description: initialData?.description || "",
      category_slug: initialData?.category_slug || "",
      brand_id: initialData?.brand_id || "",
      stock_quantity: initialData?.stock_quantity || 0,
      has_installment_0: initialData?.has_installment_0 || false,
      image_url: initialData?.image_url || "",
      specs: initialData?.specs || {},
    },
  });

  const formData = watch();
  const imageUrl = watch("image_url");

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      if (supabase) {
        // Tránh gọi API nhiều lần nếu đã có dữ liệu
        if (brands.length > 0 && categories.length > 0) return;

        const [brandData, categoryData] = await Promise.all([
          ProductService.getBrands(supabase),
          ProductService.getCategories(supabase),
        ]);
        setBrands(brandData);
        setCategories(categoryData);

        // Thiết lập giá trị mặc định cho Brand và Category nếu đang tạo mới và chưa có giá trị
        if (!initialData) {
          const currentBrandId = watch("brand_id");
          const currentCategorySlug = watch("category_slug");

          if (!currentBrandId && brandData.length > 0) {
            setValue("brand_id", brandData[0].id);
          }
          if (!currentCategorySlug && categoryData.length > 0) {
            setValue("category_slug", categoryData[0].slug);
          }
        }
      }
    };
    fetchData();
  }, [initialData, setValue, watch, brands.length, categories.length]);

  const onSubmit = async (values: ProductFormData) => {
    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return { success: false, message: "Cấu hình Supabase chưa hoàn thiện!" };
    }

    try {
      // Transformation to match database types if necessary
      const payload = {
        ...values,
      };

      const { error } = initialData
        ? await ProductService.updateProduct(supabase, initialData.id, payload as any)
        : await ProductService.createProduct(supabase, payload as any);

      if (error) throw error;
      return {
        success: true,
        message: initialData ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!",
      };
    } catch (err: any) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
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
    isEdit: !!initialData,
  };
}


