import { Product, ProductWithDetails, Category, Brand } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * ProductService - Handles data fetching for products.
 * Requires a Supabase client to be passed in, making it universal for Server/Client components.
 */
export const ProductService = {
  /**
   * Fetches a list of products with their brand and category information.
   */
  async getProducts(supabase: SupabaseClient): Promise<ProductWithDetails[]> {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        brands (*),
        categories (*)
      `)
      .order("created_at", { ascending: false });

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
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }

    return data as Product;
  },

  /**
   * Fetches all product categories.
   */
  async getCategories(supabase: SupabaseClient): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

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
      .single();

    if (error) {
       console.error(`Error fetching category ${slug}:`, error.message);
       return null;
    }
    return data as Category;
  },

  /**
   * Fetches products grouped by a specific category slug.
   */
  async getProductsByCategory(supabase: SupabaseClient, categorySlug: string): Promise<ProductWithDetails[]> {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        brands (*),
        categories (*)
      `)
      .eq("category_slug", categorySlug)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching products for category ${categorySlug}:`, error.message);
      return [];
    }
    
    return (data as ProductWithDetails[]) || [];
  },

  /**
   * Fetches all brands.
   */
  async getBrands(supabase: SupabaseClient): Promise<Brand[]> {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name");

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
       console.error("Supabase Error [createProduct]:", error.message);
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
      console.error("Supabase Error [updateProduct]:", error.message);
    }

    return { data: data as Product, error };
  },

  /**
   * Deletes a product.
   */
  async deleteProduct(supabase: SupabaseClient, id: string) {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase Error [deleteProduct]:", error.message);
    }

    return { error };
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
};
