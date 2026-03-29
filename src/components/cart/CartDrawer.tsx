"use client";

import React, { useEffect } from "react";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import CartItem from "./CartItem";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";

export default function CartDrawer() {
  const { isOpen, setIsOpen, items, fetchCart, getTotalPrice, getTotalItems, isLoading } = useCartStore();
  const supabase = createClient();

  // Fetch cart on mount if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetchCart(user.id);
      }
    };
    checkAuth();
  }, [supabase, fetchCart]);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 z-[70] h-full w-full max-w-[420px] bg-white shadow-2xl animate-in slide-in-from-right duration-500 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary" size={20} />
            <h2 className="text-xl font-black text-slate-900">Giỏ hàng của bạn</h2>
            <span className="bg-slate-100 text-slate-600 text-[11px] font-black px-2 py-0.5 rounded-full">
              {getTotalItems()}
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={32} className="text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Giỏ hàng đang trống</h3>
              <p className="text-slate-500 text-sm max-w-[240px]">
                Hãy tiếp tục khám phá và bổ sung thêm sản phẩm yêu thích vào giỏ hàng nhé!
              </p>
              <Button 
                onClick={() => setIsOpen(false)} 
                className="mt-8 px-8 py-3 rounded-2xl"
                variant="primary"
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Tổng cộng:</span>
              <span className="text-2xl font-black text-primary">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed text-center">
              Giá đã bao gồm thuế VAT (nếu có). Phí vận chuyển và các mã giảm giá sẽ được áp dụng tại bước thanh toán.
            </p>

            <Button 
              className="w-full py-6 rounded-2xl flex items-center justify-center gap-2 group"
              variant="primary"
            >
              Tiến hành thanh toán
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
