import { create } from "zustand";
import { WishlistItem, Product } from "@/types/database";
import { WishlistService } from "@/services/wishlistService";
import { createClient } from "@/utils/supabase/client";

interface WishlistState {
  items: WishlistItem[];
  userId: string | null;
  isLoading: boolean;
  
  // Actions
  fetchWishlist: (userId: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearWishlist: () => void;
  
  // Getters
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  userId: null,
  isLoading: false,

  fetchWishlist: async (userId) => {
    const supabase = createClient();
    if (!supabase) return;
    
    set({ isLoading: true, userId });
    try {
      const items = await WishlistService.fetchWishlist(supabase, userId);
      set({ items, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (product) => {
    const { items, userId } = get();
    if (!userId) return;

    const supabase = createClient();
    if (!supabase) return;

    const isWishlisted = items.some(item => item.product_id === product.id);

    if (isWishlisted) {
      const success = await WishlistService.removeFromWishlist(supabase, userId, product.id);
      if (success) {
        set({ items: items.filter(item => item.product_id !== product.id) });
      }
    } else {
      const success = await WishlistService.addToWishlist(supabase, userId, product.id);
      if (success) {
        // Optimistically add to list (or fetch again)
        const newItem: WishlistItem = {
          id: Math.random().toString(), // Temporary ID for optimistic UI
          user_id: userId,
          product_id: product.id,
          created_at: new Date().toISOString(),
          products: product
        };
        set({ items: [newItem, ...items] });
      }
    }
  },

  removeItem: async (productId) => {
    const { items, userId } = get();
    if (!userId) return;

    const supabase = createClient();
    if (!supabase) return;

    const success = await WishlistService.removeFromWishlist(supabase, userId, productId);
    if (success) {
      set({ items: items.filter(item => item.product_id !== productId) });
    }
  },

  clearWishlist: () => set({ items: [], userId: null }),

  isInWishlist: (productId) => {
    return get().items.some(item => item.product_id === productId);
  },
}));
