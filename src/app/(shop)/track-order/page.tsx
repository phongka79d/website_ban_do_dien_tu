"use client";

import React, { useState } from "react";
import {
  Search,
  Package,
  Hash,
  AlertCircle,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OrderService } from "@/services/orderService";
import { createClient } from "@/utils/supabase/client";
import { OrderWithItems } from "@/types/database";
import { formatCurrency } from "@/utils/format";
import { ProductImage } from "@/components/common/ProductImage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !orderId) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    const cleanOrderId = orderId.trim().startsWith('#')
      ? orderId.trim().substring(1)
      : orderId.trim();

    const { data, error: fetchError } = await OrderService.fetchOrderByPublicInfo(supabase, cleanOrderId);

    if (fetchError) {
      setError(fetchError);
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { label: "Chờ xác nhận", icon: <Clock className="text-amber-500" />, color: "bg-amber-500" };
      case 'processing': return { label: "Đang xử lý", icon: <Package className="text-blue-500" />, color: "bg-blue-500" };
      case 'shipped': return { label: "Đang giao hàng", icon: <Truck className="text-indigo-500" />, color: "bg-indigo-500" };
      case 'delivered': return { label: "Đã giao hàng", icon: <CheckCircle2 className="text-green-500" />, color: "bg-green-500" };
      case 'cancelled': return { label: "Đã hủy", icon: <XCircle className="text-red-500" />, color: "bg-red-500" };
      default: return { label: status, icon: <AlertCircle />, color: "bg-gray-500" };
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-slate-900 mb-4 tracking-tight"
        >
          Tra cứu Đơn hàng
        </motion.h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Chỉ cần nhập chính xác mã đơn hàng của bạn để cập nhật tình trạng mới nhất.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="p-8 border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[2.5rem]">
          <form onSubmit={handleTrack} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block text-center">Nhập mã đơn hàng của bạn</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="VD: 3eee5f1a..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-lg font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={loading}
              leftIcon={<Search size={20} />}
              className="h-14 rounded-3xl shadow-xl shadow-primary/20 text-base"
            >
              Kiểm tra ngay
            </Button>
          </form>
        </Card>

        <AnimatePresence mode="wait">
          {order ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="p-8 border-white shadow-xl bg-white rounded-[2rem] overflow-hidden relative">
                <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-white text-[10px] font-black uppercase tracking-widest ${getStatusInfo(order.status).color}`}>
                  {getStatusInfo(order.status).label}
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-slate-100 p-4 rounded-2xl">
                    {getStatusInfo(order.status).icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Chi tiết Đơn hàng</h2>
                    <p className="text-xs text-slate-400 font-mono">#{order.id}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-10 px-4">
                  {['pending', 'processing', 'shipped', 'delivered'].map((s, idx) => {
                    const statusMapping: Record<string, string[]> = {
                      'pending': ['pending'],
                      'processing': ['pending', 'processing'],
                      'shipped': ['pending', 'processing', 'shipped'],
                      'delivered': ['pending', 'processing', 'shipped', 'delivered']
                    };
                    const activeStages = statusMapping[order.status] || [];
                    const isActive = activeStages.includes(s);

                    return (
                      <div key={s} className="flex flex-col items-center gap-2 relative last:flex-1 last:items-end flex-1 first:items-start items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-white border-slate-200 text-slate-300'
                          }`}>
                          {isActive ? <CheckCircle2 size={16} /> : idx + 1}
                        </div>
                        {idx < 3 && (
                          <div className={`absolute top-4 left-8 right-0 h-[2px] -z-10 ${isActive ? 'bg-primary' : 'bg-slate-100'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Người nhận</p>
                    <p className="font-bold text-slate-800">Khách hàng tra cứu</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Số điện thoại</p>
                    <p className="font-bold text-slate-800">{order.phone_number}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Địa chỉ giao hàng</p>
                    <p className="font-bold text-slate-800">{order.shipping_address}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8 border-slate-100 rounded-[2rem]">
                <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">Sản phẩm đã mua</h3>
                <div className="space-y-4">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-colors">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0">
                        <ProductImage
                          src={item.products?.image_url}
                          alt={item.products?.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate mb-1">
                          {item.products?.name || "Sản phẩm không xác định"}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Số lượng: <span className="font-black text-slate-900">{item.quantity}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary">
                          {formatCurrency(item.price_at_purchase * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Tổng cộng:</span>
                  <span className="text-2xl font-black text-slate-900">{formatCurrency(order.total_amount)}</span>
                </div>
              </Card>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 rounded-[2rem] p-12 text-center"
            >
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-100">
                <AlertCircle className="text-red-500" size={40} />
              </div>
              <h2 className="text-2xl font-black text-red-900 mb-2">Không tìm thấy đơn hàng</h2>
              <p className="text-red-600/70 mb-8 max-w-sm mx-auto">{error}</p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
