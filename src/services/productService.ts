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
};
