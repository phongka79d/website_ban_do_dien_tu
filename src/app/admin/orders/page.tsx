"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { OrderService } from "@/services/orderService";
import { OrderWithItems } from "@/types/database";
import { Search, ShoppingCart, User, MapPin, Phone, Calendar, ArrowRight, Filter, AlertCircle, Loader2, Package } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import { statusConfigs } from "@/components/common/OrderStatusBadge";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import NotificationModal from "@/components/common/NotificationModal";
import { ProductImage } from "@/components/common/ProductImage";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Status Update State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState<{ id: string; status: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Notification State
  const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const fetchOrders = async () => {
    const supabase = createClient();
    if (supabase) {
      const data = await OrderService.fetchAllOrders(supabase);
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setOrderToUpdate({ id, status: newStatus });
    setStatusModalOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!orderToUpdate) return;

    setIsUpdating(true);
    const supabase = createClient();
    if (supabase) {
      const { success, error } = await OrderService.updateOrderStatus(supabase, orderToUpdate.id, orderToUpdate.status);
      if (success) {
        setNotification({
          isOpen: true,
          title: "Thành công",
          message: "Đã cập nhật trạng thái đơn hàng.",
          type: "success",
        });
        fetchOrders();
      } else {
        setNotification({
          isOpen: true,
          title: "Lỗi",
          message: error?.message || "Không thể cập nhật trạng thái.",
          type: "error",
        });
      }
    }
    setIsUpdating(false);
    setStatusModalOpen(false);
    setOrderToUpdate(null);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="mt-4 text-slate-400 font-bold animate-pulse text-[14px]">Đang tải danh sách đơn hàng...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <header className="flex flex-col gap-6">
        <div>
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">
            Quản lý <span className="text-primary italic">Đơn hàng</span>
          </h1>
          <p className="text-slate-500 text-[14px] font-medium mt-1">
            Tổng cộng: <span className="text-primary font-black">{orders.length}</span> đơn hàng đã được ghi nhận.
          </p>
        </div>

        {/* Search & Tabs Bar */}
        <div className="flex flex-col gap-6">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo ID, Số điện thoại hoặc Địa chỉ nhận hàng..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-white shadow-sm focus:border-primary outline-none transition-all placeholder:text-slate-300 font-bold text-[14px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex overflow-x-auto gap-2 no-scrollbar">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filterStatus === "all"
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
                  : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                }`}
            >
              Tất cả
            </button>
            {Object.keys(statusConfigs).map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => setFilterStatus(statusKey)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filterStatus === statusKey
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                  }`}
              >
                {statusConfigs[statusKey].label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="group overflow-hidden border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
            {/* New Header Bar */}
            <div className="bg-slate-50/50 border-b border-slate-200 p-4 px-6 md:px-8 flex items-center justify-between group-hover:bg-slate-50 transition-colors duration-500">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-primary">
                  <Package size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base">#{order.id.slice(0, 8)}</h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(order.created_at)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                {/* Left: General Order Info (Contact) */}
                <div className="space-y-5 flex-1">
                  <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-2">
                    <User size={14} /> Thông tin khách hàng
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 group-hover:bg-white transition-colors duration-500 shadow-sm">
                      <MapPin className="text-slate-400 mt-1" size={16} />
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Địa chỉ giao hàng</p>
                        <p className="text-sm font-bold text-slate-700 leading-snug">{order.shipping_address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 group-hover:bg-white transition-colors duration-500 shadow-sm">
                      <Phone className="text-slate-400 mt-1" size={16} />
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Số điện thoại</p>
                        <p className="text-sm font-bold text-slate-700">{order.phone_number}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center: List of products (Brief) */}
                <div className="flex-[2] border-y lg:border-y-0 lg:border-x border-slate-200/60 py-6 lg:py-0 lg:px-10">
                  <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-5 flex items-center gap-2">
                    <ShoppingCart size={14} /> Sản phẩm ({order.order_items.length})
                  </p>
                  <div className="space-y-5 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1.5 shrink-0 overflow-hidden">
                          <ProductImage src={item.products?.image_url || ""} alt={item.products?.name || "Sản phẩm"} className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{item.products?.name}</p>
                          <p className="text-xs font-bold text-slate-400 mt-0.5">SL: {item.quantity} × {formatCurrency(item.price_at_purchase)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Summary & Action */}
                <div className="lg:w-60 flex flex-col justify-between items-end text-right">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tổng thanh toán</p>
                    <p className="text-xl font-black text-primary tracking-tighter">{formatCurrency(order.total_amount)}</p>
                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-[9px] font-black uppercase rounded text-slate-500 italic">
                      {order.payment_method?.toLowerCase() === 'cod' ? 'Thanh toán COD' : 'Chuyển khoản'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 w-full mt-4">
                    <div className="relative group/select">
                      <select
                        className="w-full h-9 pl-4 pr-10 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-600 outline-none hover:bg-slate-100 transition-colors appearance-none cursor-pointer"
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      >
                        {Object.keys(statusConfigs).map(key => (
                          <option key={key} value={key}>{statusConfigs[key].label}</option>
                        ))}
                      </select>
                      <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <AlertCircle size={40} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-black text-[18px]">Không tìm thấy đơn hàng nào</p>
            <p className="text-slate-300 text-sm mt-1">Thử lại với từ khóa hoặc bộ lọc khác</p>
            <button
              onClick={() => { setSearchTerm(""); setFilterStatus("all"); }}
              className="text-primary text-[14px] font-bold mt-4 hover:underline"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={confirmStatusUpdate}
        title="Xác nhận thay đổi"
        message={`Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng này sang "${orderToUpdate ? statusConfigs[orderToUpdate.status].label : ""}"?`}
        confirmText="Cập nhật ngay"
        type="info"
        loading={isUpdating}
      />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
