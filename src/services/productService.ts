import { createClient } from "@/utils/supabase/server";
import { Product, ProductWithDetails, Category } from "@/types/database";

/**
 * ProductService - Handles data fetching for products using Supabase.
 * Follows SOLID principles and provides clean interfaces for components.
 */
export const ProductService = {
  /**
   * Fetches a list of products with their brand and category information.
   * @returns {Promise<ProductWithDetails[]>} List of products.
   */
  async getProducts(): Promise<ProductWithDetails[]> {
    const supabase = await createClient();
    
    if (!supabase) return [];

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

    console.log("Supabase Data [getProducts]:", data?.length, "products found");
    return (data as any) || [];
  },

  /**
   * Fetches a single product by its ID with all associated images.
   * @param {string} id - The UUID of the product.
   * @returns {Promise<Product | null>} The product details or null.
   */
  async getProductById(id: string): Promise<Product | null> {
    const supabase = await createClient();
    
    if (!supabase) return null;

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

    return data as any;
  },

  /**
   * Fetches all product categories.
   * @returns {Promise<Category[]>} List of categories.
   */
  async getCategories(): Promise<Category[]> {
    const supabase = await createClient();
    
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data || [];
  }
};
