import { Banner } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * BannerService - Handles data fetching and manipulation for homepage banners.
 */
export const BannerService = {
  /**
   * Fetches all banners, ordered by display_order.
   */
  async getBanners(supabase: SupabaseClient, onlyActive = true): Promise<Banner[]> {
    let query = supabase
      .from("banners")
      .select("*")
      .order("display_order", { ascending: true });

    if (onlyActive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase Error [getBanners]:", error.message);
      return [];
    }

    return (data as Banner[]) || [];
  },

  /**
   * Fetches a single banner by its ID.
   */
  async getBannerById(supabase: SupabaseClient, id: string): Promise<Banner | null> {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching banner ${id}:`, error);
      return null;
    }

    return data as Banner;
  },

  /**
   * Creates a new banner.
   */
  async createBanner(supabase: SupabaseClient, banner: Partial<Banner>): Promise<{ data: Banner | null, error: any }> {
    const { data, error } = await supabase
      .from("banners")
      .insert([banner])
      .select()
      .single();

    if (error) {
      console.error("Supabase Error [createBanner]:", error.message);
    }

    return { data: data as Banner, error };
  },

  /**
   * Updates an existing banner.
   */
  async updateBanner(supabase: SupabaseClient, id: string, bannerData: Partial<Banner>) {
    const { data, error } = await supabase
      .from("banners")
      .update(bannerData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase Error [updateBanner]:", error.message);
    }

    return { data: data as Banner, error };
  },

  /**
   * Deletes a banner.
   */
  async deleteBanner(supabase: SupabaseClient, id: string) {
    const { error } = await supabase
      .from("banners")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase Error [deleteBanner]:", error.message);
    }

    return { error };
  },
};
