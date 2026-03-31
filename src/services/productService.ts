import { Product, ProductWithDetails, Category, Brand } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * ProductService - Handles data fetching for products.
 * Requires a Supabase client to be passed in, making it universal for Server/Client components.
 */
export const ProductService = {
  /**
   * Fetches a list of products with their brand and category information.
   * @param onlyActive If true, only fetches products where is_active is true.
   */
  async getProducts(supabase: SupabaseClient, onlyActive: boolean = true): Promise<ProductWithDetails[]> {
    let query = supabase
      .from("products")
      .select(`
        *,
        brands (*),
        categories (*)
      `);
    
    if (onlyActive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error [getProducts]:", error.message, error.details);
      return [];
    }

    return (data as ProductWithDetails[]) || [];
  },

  /**
   * Fetches a single product by its ID.
   */
  async getProductById(supabase: SupabaseClient, id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        brands (*),
        categories (*),
        product_images (*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      // PGRST116: The query returned 0 rows (Normal case when product id doesn't exist)
      if (error.code === "PGRST116") return null;

      console.error(`Error fetching product ${id}:`, error.message);
      return null;
    }

    return data as Product;
  },

  /**
   * Fetches all product categories.
   */
  async getCategories(supabase: SupabaseClient, onlyActive: boolean = true): Promise<Category[]> {
    let query = supabase
      .from("categories")
      .select("*");
    
    if (onlyActive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query.order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data || [];
  },

  /**
   * Fetches a single category by slug.
   */
  async getCategoryBySlug(supabase: SupabaseClient, slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching category ${slug}:`, error.message);
      return null;
    }
    return data as Category;
  },

  /**
   * Fetches products grouped by a specific category slug.
   */
  async getProductsByCategory(
    supabase: SupabaseClient, 
    categorySlug: string, 
    onlyActive: boolean = true,
    sortBy: "default" | "hot" | "discount" | "price_asc" | "price_desc" = "default"
  ): Promise<ProductWithDetails[]> {
    const tableName = sortBy !== "default" ? "products_with_metrics" : "products";

    let query = supabase
      .from(tableName)
      .select(`
        *,
        brands (*),
        categories (*)
      `)
      .eq("category_slug", categorySlug);

    if (onlyActive) {
      query = query.eq("is_active", true);
    }

    // Sorting Logic
    if (sortBy === "hot") {
      query = query.order("hot_score", { ascending: false, nullsFirst: false });
    } else if (sortBy === "discount") {
      query = query.order("discount_percentage", { ascending: false, nullsFirst: false });
    } else if (sortBy === "price_asc") {
      query = query.order("price", { ascending: true });
    } else if (sortBy === "price_desc") {
      query = query.order("price", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching products for category ${categorySlug}:`, error.message);
      return [];
    }

    return (data as ProductWithDetails[]) || [];
  },

  /**
   * Fetches all brands.
   */
  async getBrands(supabase: SupabaseClient, onlyActive: boolean = true): Promise<Brand[]> {
    let query = supabase
      .from("brands")
      .select("*");
    
    if (onlyActive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query.order("name");

    if (error) {
      console.error("Error fetching brands:", error);
      return [];
    }

    return data || [];
  },

  /**
   * Creates a new product.
   */
  async createProduct(supabase: SupabaseClient, product: Partial<Product>): Promise<{ data: Product | null, error: any }> {
    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select()
      .single();

    if (error) {
      // Logic log có thể được giữ lại để debug trong môi trường dev, 
      // nhưng tránh log toàn bộ stack trace hoặc thông tin kỹ thuật quá chi tiết
      // console.error("Database Error [createProduct]:", error.message);
    }

    return { data: data as Product, error };
  },

  /**
   * Updates an existing product.
   */
  async updateProduct(supabase: SupabaseClient, id: string, productData: Partial<Product>) {
    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // console.error("Database Error [updateProduct]:", error.message);
    }

    return { data: data as Product, error };
  },

  /**
   * Xóa sản phẩm an toàn (Hybrid Delete)
   */
  async safeDeleteProduct(supabase: SupabaseClient, id: string): Promise<{ success: boolean; type: 'hard' | 'soft'; error: any }> {
    try {
      // 1. Dọn dẹp khỏi Giỏ hàng và Mục yêu thích
      await supabase.from("cart_items").delete().eq("product_id", id);
      await supabase.from("wishlist_items").delete().eq("product_id", id);

      // 2. Kiểm tra xem đã có đơn hàng chưa
      const { count, error: countError } = await supabase
        .from("order_items")
        .select("*", { count: "exact", head: true })
        .eq("product_id", id);
      
      if (countError) throw countError;

      if (count && count > 0) {
        // Có đơn hàng -> Vô hiệu hóa
        const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id);
        if (error) throw error;
        return { success: true, type: 'soft', error: null };
      } else {
        // Không có đơn hàng -> Xóa vĩnh viễn
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        return { success: true, type: 'hard', error: null };
      }
    } catch (error: any) {
      console.error("Error in safeDeleteProduct:", error.message || error);
      return { success: false, type: 'hard', error };
    }
  },

  /**
   * Khôi phục sản phẩm (Reactivate)
   */
  async reactivateProduct(supabase: SupabaseClient, id: string) {
    const { data, error } = await supabase
      .from("products")
      .update({ is_active: true })
      .eq("id", id)
      .select()
      .single();
    
    return { data: data as Product, error };
  },

  /**
   * Xóa danh mục an toàn (Hybrid Delete)
   */
  async safeDeleteCategory(supabase: SupabaseClient, id: string, slug: string): Promise<{ success: boolean; type: 'hard' | 'soft'; error: any }> {
    try {
      // 1. Lấy danh sách ID sản phẩm thuộc danh mục này
      const { data: products, error: prodError } = await supabase
        .from("products")
        .select("id")
        .eq("category_slug", slug);
      
      if (prodError) throw prodError;

      // 2. Kiểm tra xem có sản phẩm nào đã có đơn hàng chưa (Dùng slug để query chính xác)
      let hasOrders = false;
      if (products && products.length > 0) {
        const productIds = products.map(p => p.id);
        const { count, error: orderError } = await supabase
          .from("order_items")
          .select("*", { count: "exact", head: true })
          .in("product_id", productIds);
        
        if (orderError) throw orderError;
        hasOrders = (count !== null && count > 0);
      }

      if (hasOrders) {
        // Có đơn hàng liên quan -> Vô hiệu hóa danh mục và tất cả sản phẩm của nó
        const { error: catError } = await supabase.from("categories").update({ is_active: false }).eq("id", id);
        if (catError) throw catError;
        
        await supabase.from("products").update({ is_active: false }).eq("category_slug", slug);
        return { success: true, type: 'soft', error: null };
      } else {
        // Sạch -> Xóa tất cả sản phẩm trước, sau đó xóa danh mục
        if (products && products.length > 0) {
          for (const p of products) {
            await this.safeDeleteProduct(supabase, p.id);
          }
        }
        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (error) throw error;
        return { success: true, type: 'hard', error: null };
      }
    } catch (error: any) {
      console.error("Error in safeDeleteCategory:", error.message || error);
      return { success: false, type: 'hard', error };
    }
  },

  /**
   * Khôi phục danh mục (Reactivate) + Phục hồi toàn bộ sản phẩm của nó
   */
  async reactivateCategory(supabase: SupabaseClient, id: string, slug: string) {
    // 1. Phục hồi danh mục
    const { data, error } = await supabase
      .from("categories")
      .update({ is_active: true })
      .eq("id", id)
      .select()
      .single();
    
    if (error) return { data: null, error };

    // 2. Phục hồi toàn bộ sản phẩm thuộc danh mục này
    await supabase.from("products").update({ is_active: true }).eq("category_slug", slug);

    return { data: data as Category, error };
  },

  /**
   * Xóa thương hiệu an toàn (Hybrid Delete)
   */
  async safeDeleteBrand(supabase: SupabaseClient, id: string): Promise<{ success: boolean; type: 'hard' | 'soft'; error: any }> {
    try {
      const { data: products, error: prodError } = await supabase
        .from("products")
        .select("id")
        .eq("brand_id", id);
      
      if (prodError) throw prodError;

      let hasOrders = false;
      if (products && products.length > 0) {
        const productIds = products.map(p => p.id);
        const { count, error: orderError } = await supabase
          .from("order_items")
          .select("*", { count: "exact", head: true })
          .in("product_id", productIds);
        
        if (orderError) throw orderError;
        hasOrders = (count !== null && count > 0);
      }

      if (hasOrders) {
        const { error: brandError } = await supabase.from("brands").update({ is_active: false }).eq("id", id);
        if (brandError) throw brandError;
        
        await supabase.from("products").update({ is_active: false }).eq("brand_id", id);
        return { success: true, type: 'soft', error: null };
      } else {
        if (products && products.length > 0) {
          for (const p of products) {
            await this.safeDeleteProduct(supabase, p.id);
          }
        }
        const { error } = await supabase.from("brands").delete().eq("id", id);
        if (error) throw error;
        return { success: true, type: 'hard', error: null };
      }
    } catch (error: any) {
      console.error("Error in safeDeleteBrand:", error.message || error);
      return { success: false, type: 'hard', error };
    }
  },

  /**
   * Khôi phục thương hiệu (Reactivate) + Phục hồi toàn bộ sản phẩm của nó
   */
  async reactivateBrand(supabase: SupabaseClient, id: string) {
    // 1. Phục hồi thương hiệu
    const { data, error } = await supabase
      .from("brands")
      .update({ is_active: true })
      .eq("id", id)
      .select()
      .single();
    
    if (error) return { data: null, error };

    // 2. Phục hồi toàn bộ sản phẩm thuộc thương hiệu này
    await supabase.from("products").update({ is_active: true }).eq("brand_id", id);
    
    return { data: data as Brand, error };
  },

  // --- Category Methods ---

  async createCategory(supabase: SupabaseClient, category: Partial<Category>) {
    const { data, error } = await supabase
      .from("categories")
      .insert([category])
      .select()
      .single();
    return { data: data as Category, error };
  },

  async updateCategory(supabase: SupabaseClient, id: string, categoryData: Partial<Category>) {
    const { data, error } = await supabase
      .from("categories")
      .update(categoryData)
      .eq("id", id) // Wait, categories use 'slug' or 'id'? Let's check database types.
      .select()
      .single();
    return { data: data as Category, error };
  },

  async deleteCategory(supabase: SupabaseClient, id: string) {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
    return { error };
  },

  // --- Brand Methods ---

  async createBrand(supabase: SupabaseClient, brand: Partial<Brand>) {
    const { data, error } = await supabase
      .from("brands")
      .insert([brand])
      .select()
      .single();
    return { data: data as Brand, error };
  },

  async updateBrand(supabase: SupabaseClient, id: string, brandData: Partial<Brand>) {
    const { data, error } = await supabase
      .from("brands")
      .update(brandData)
      .eq("id", id)
      .select()
      .single();
    return { data: data as Brand, error };
  },

  async deleteBrand(supabase: SupabaseClient, id: string) {
    const { error } = await supabase
      .from("brands")
      .delete()
      .eq("id", id);
    return { error };
  },

  /**
   * Fetches all image URLs of products belonging to a specific category slug.
   * Useful for cleaning up Cloudinary storage before deleting a category.
   */
  async getProductImagesByCategorySlug(supabase: SupabaseClient, categorySlug: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("products")
      .select("image_url")
      .eq("category_slug", categorySlug);

    if (error) {
      console.error("Supabase Error [getProductImagesByCategorySlug]:", error.message);
      return [];
    }

    return data?.map(p => p.image_url).filter(Boolean) as string[] || [];
  },

  /**
   * SERVER-SIDE SEARCH: Products
   * Filters by name or brand name.
   */
  /**
   * SERVER-SIDE SEARCH: Products with Pagination
   */
  async searchProducts(
    supabase: SupabaseClient, 
    query: string, 
    page: number = 1,
    pageSize: number = 20,
    sortBy: "default" | "hot" | "discount" | "price_asc" | "price_desc" = "default"
  ): Promise<{ data: ProductWithDetails[]; count: number }> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Use the view for advanced sorting to get metrics like hot_score
    const tableName = sortBy !== "default" ? "products_with_metrics" : "products";

    console.log(`[DEBUG] ProductService - Using table: ${tableName}, sortBy: ${sortBy}`);

    let baseQuery = supabase
      .from(tableName)
      .select(`
        *,
        brands (*),
        categories (*)
      `, { count: "exact" });
    
    if (query) {
      baseQuery = baseQuery.ilike("name", `%${query}%`);
    }

    // Sorting Logic
    if (sortBy === "hot") {
      baseQuery = baseQuery.order("hot_score", { ascending: false, nullsFirst: false });
    } else if (sortBy === "discount") {
      baseQuery = baseQuery.order("discount_percentage", { ascending: false, nullsFirst: false });
    } else if (sortBy === "price_asc") {
      baseQuery = baseQuery.order("price", { ascending: true });
    } else if (sortBy === "price_desc") {
      baseQuery = baseQuery.order("price", { ascending: false });
    } else {
      baseQuery = baseQuery.order("created_at", { ascending: false });
    }

    const { data, error, count } = await baseQuery.range(from, to);

    if (error) {
      console.error("Supabase Error [searchProducts]:", error.message);
      return { data: [], count: 0 };
    }

    return { 
      data: (data as ProductWithDetails[]) || [], 
      count: count || 0 
    };
  },

  /**
   * SERVER-SIDE SEARCH: Categories with Pagination
   */
  async searchCategories(
    supabase: SupabaseClient, 
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: Category[]; count: number }> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let baseQuery = supabase.from("categories").select("*", { count: "exact" });
    
    if (query) {
      baseQuery = baseQuery.ilike("name", `%${query}%`);
    }

    const { data, error, count } = await baseQuery
      .order("name")
      .range(from, to);

    if (error) {
      console.error("Supabase Error [searchCategories]:", error.message);
      return { data: [], count: 0 };
    }

    return { data: data || [], count: count || 0 };
  },

  /**
   * SERVER-SIDE SEARCH: Brands with Pagination
   */
  async searchBrands(
    supabase: SupabaseClient, 
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: Brand[]; count: number }> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let baseQuery = supabase.from("brands").select("*", { count: "exact" });
    
    if (query) {
      baseQuery = baseQuery.ilike("name", `%${query}%`);
    }

    const { data, error, count } = await baseQuery
      .order("name")
      .range(from, to);

    if (error) {
      console.error("Supabase Error [searchBrands]:", error.message);
      return { data: [], count: 0 };
    }

    return { data: data || [], count: count || 0 };
  },
};
