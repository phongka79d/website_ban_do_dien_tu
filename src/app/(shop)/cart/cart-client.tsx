"use client";

import React from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import CartItemComponent from "@/components/cart/CartItem";
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, RefreshCcw } from "lucide-react";
import { CartItem } from "@/types/database";

export default function CartClient() {
  const { items, getTotalPrice, getTotalItems, isLoading } = useCartStore();
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-slate-300" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-4">Giỏ hàng rỗng</h1>
          <p className="text-slate-500 mb-8">
            Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các sản phẩm công nghệ mới nhất của chúng tôi nhé!
          </p>
          <Link href="/products">
            <Button size="lg" className="rounded-full px-8">
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
          Giỏ hàng của bạn
          <span className="text-sm font-medium text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
            {totalItems} sản phẩm
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card variant="flat" className="p-2 md:p-6 divide-y divide-slate-100">
              {items.map((item: CartItem) => (
                <CartItemComponent key={item.id} item={item} />
              ))}
            </Card>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Giao hàng miễn phí</h4>
                  <p className="text-[10px] text-slate-500">Cho đơn hàng từ 5tr</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                <div className="bg-green-50 p-2 rounded-xl text-green-500">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Bảo mật 100%</h4>
                  <p className="text-[10px] text-slate-500">Thanh toán an toàn</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                <div className="bg-orange-50 p-2 rounded-xl text-orange-500">
                  <RefreshCcw size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Đổi trả 30 ngày</h4>
                  <p className="text-[10px] text-slate-500">An tâm mua sắm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-1 sticky top-28">
            <Card variant="glass" radius="xl" className="p-6 md:p-8 border-white/40 shadow-2xl">
              <h2 className="text-xl font-black text-slate-900 mb-6">Đơn hàng</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Tạm tính ({totalItems} sản phẩm)</span>
                  <span className="font-bold text-slate-900">
                    {totalPrice.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-500 font-bold uppercase text-[10px] bg-green-50 px-2 py-0.5 rounded">Miễn phí</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                  <span className="text-slate-900 font-bold">Tổng cộng</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary leading-none">
                      {totalPrice.toLocaleString("vi-VN")}₫
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">(Đã bao gồm VAT nếu có)</p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="w-full rounded-2xl h-14 text-base font-black group">
                Thanh toán
              </Button>

              <div className="mt-6">
                <Link href="/products" className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center justify-center gap-2">
                  Tiếp tục mua sắm
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
