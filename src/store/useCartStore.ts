import { create } from "zustand";
import { type CartItem, type Product } from "@/types/database";
import { CartService } from "@/services/cartService";
import { createClient } from "@/utils/supabase/client";

interface CartState {
  items: CartItem[];
  cartId: string | null;
  userId: string | null;
  isLoading: boolean;
  isOpen: boolean;
  
  // Actions
  setIsOpen: (open: boolean) => void;
  fetchCart: (userId: string) => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  
  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartId: null,
  userId: null,
  isLoading: false,
  isOpen: false,

  setIsOpen: (open) => set({ isOpen: open }),

  fetchCart: async (userId) => {
    const supabase = createClient();
    if (!supabase) return;
    
    set({ isLoading: true, userId });
    try {
      const cartId = await CartService.getOrCreateCart(supabase, userId);
      const items = await CartService.fetchCartItems(supabase, cartId);
      set({ cartId, items, isLoading: false });
    } catch (error: any) {
      console.error("Failed to fetch cart:", error.message || error, error.code ? `(Code: ${error.code})` : "");
      set({ isLoading: false });
    }
  },

  addItem: async (product, quantity = 1) => {
    const { cartId, userId } = get();
    if (!cartId || !userId) return;

    const supabase = createClient();
    if (!supabase) return;

    const success = await CartService.addToCart(supabase, cartId, product.id, quantity);
    
    if (success) {
      const updatedItems = await CartService.fetchCartItems(supabase, cartId);
      set({ items: updatedItems, isOpen: true });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    const supabase = createClient();
    if (!supabase) return;

    const success = await CartService.updateQuantity(supabase, itemId, quantity);
    if (success) {
      const items = get().items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0);
      set({ items });
    }
  },

  removeItem: async (itemId) => {
    const supabase = createClient();
    if (!supabase) return;

    const success = await CartService.removeFromCart(supabase, itemId);
    if (success) {
      set({ items: get().items.filter((item) => item.id !== itemId) });
    }
  },

  clearCart: () => set({ items: [], cartId: null, userId: null }),

  getTotalItems: () => {
    return get().items.length;
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => {
      const price = item.products?.price || 0;
      return total + price * item.quantity;
    }, 0);
  },
}));
