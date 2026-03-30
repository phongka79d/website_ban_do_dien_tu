"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/common/ProductImage";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { OrderWithItems } from "@/types/database";
import { formatCurrency, formatDate } from "@/utils/format";
import { OrderService } from "@/services/orderService";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface OrderCardProps {
  order: OrderWithItems;
  userId: string;
}

export default function OrderCard({ order, userId }: OrderCardProps) {
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCopy = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelLink = async () => {
    if (!supabase) return;
    setLoading(true);
    const { success, error } = await OrderService.cancelOrder(supabase, order.id, userId);
    if (success) {
      setShowConfirm(false);
      router.refresh();
    } else {
      alert(error || "Có lỗi xảy ra khi hủy đơn hàng.");
    }
    setLoading(false);
  };


  return (
    <Card radius="2xl" className="overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="p-6">
        {/* Order Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mã đơn hàng</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-slate-900">#{order.id.slice(0, 8)}</p>
                <button 
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-primary rounded-lg transition-all"
                  title="Copy full ID"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày đặt</p>
              <p className="text-sm font-bold text-slate-900">{formatDate(order.created_at)}</p>
            </div>
            <OrderStatusBadge status={order.status} showIcon={false} />
          </div>
        </div>

        {/* Product Items */}
        <div className="space-y-4 mb-6">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 p-2">
                <ProductImage 
                  src={item.products?.image_url || ""} 
                  alt={item.products?.name || "Product"} 
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-800 line-clamp-1">
                  {item.products?.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Số lượng: {item.quantity} × {formatCurrency(item.price_at_purchase)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Thanh toán: {order.payment_method?.toUpperCase()}</p>
            <p className="text-[10px] text-slate-400">Đ/c: {order.shipping_address?.slice(0, 20)}...</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right mr-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng tiền</p>
              <p className="text-xl font-black text-primary">{formatCurrency(order.total_amount)}</p>
            </div>

            {order.status === 'pending' && (
              <Button 
                variant="lightDanger" 
                size="sm" 
                onClick={() => setShowConfirm(true)}
                isLoading={loading}
                className="font-bold text-xs"
              >
                Hủy đơn hàng
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => !loading && setShowConfirm(false)}
        onConfirm={handleCancelLink}
        title="Xác nhận Hủy Đơn"
        message={`Bạn có chắc chắn muốn hủy đơn hàng #${order.id.slice(0, 8)}? Hành động này không thể hoàn tác.`}
        confirmText="Xác nhận Hủy"
        cancelText="Quay lại"
        type="danger"
        loading={loading}
      />
    </Card>
  );
}
