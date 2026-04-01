"use client";

import React, { useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { OrderService } from "@/services/orderService";
import { OrderWithItems } from "@/types/database";
import { 
  Search, 
  Package, 
  Eye, 
  User, 
  MapPin, 
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  XCircle,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import NotificationModal from "@/components/common/NotificationModal";
import { useAdminSearch } from "@/hooks/useAdminSearch";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency, formatDate } from "@/utils/format";
import { AdminSelect } from "@/components/admin/AdminSelect";

export default function AdminOrdersPage() {
  const supabase = createClient();
  
  // Search and Pagination logic
  const searchFn = useCallback((client: any, query: string, page: number, pageSize: number) => {
    if (!client) return Promise.resolve({ data: [], count: 0 });
    return OrderService.searchOrders(client, query, page, pageSize);
  }, []);

  const {
    searchTerm,
    setSearchTerm,
    results: orders,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    refresh: fetchOrders
  } = useAdminSearch<OrderWithItems>({
    searchFn,
    initialPageSize: 10,
    storageKey: "admin-orders-pageSize"
  });

  // State for modals and detail view
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusUpdateMode, setStatusUpdateMode] = useState<{ id: string, status: string } | null>(null);
  const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'CHỜ XÁC NHẬN', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={14} /> };
      case 'confirmed': return { label: 'ĐÃ XÁC NHẬN', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: <CheckCircle2 size={14} /> };
      case 'shipping': return { label: 'ĐANG GIAO HÀNG', color: 'bg-sky-50 text-sky-600 border-sky-100', icon: <Truck size={14} /> };
      case 'completed': return { label: 'ĐÃ HOÀN THÀNH', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={14} /> };
      case 'cancelled': return { label: 'ĐÃ HỦY', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: <XCircle size={14} /> };
      default: return { label: 'KHÔNG XÁC ĐỊNH', color: 'bg-slate-50 text-slate-600 border-slate-100', icon: <Hash size={14} /> };
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusUpdateMode || !supabase) return;
    
    setIsUpdating(true);
    const { success, error } = await OrderService.updateOrderStatus(supabase, statusUpdateMode.id, statusUpdateMode.status);
    
    if (success) {
      setNotification({
        isOpen: true,
        title: "Thành công",
        message: "Trạng thái đơn hàng đã được cập nhật.",
        type: "success"
      });
      fetchOrders();
    } else {
      setNotification({
        isOpen: true,
        title: "Lỗi cập nhật",
        message: error?.message || "Không thể cập nhật trạng thái đơn hàng.",
        type: "error"
      });
    }
    
    setIsUpdating(false);
    setStatusUpdateMode(null);
  };

  if (loading && page === 1) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-400 font-black animate-pulse text-[14px] uppercase tracking-widest">Đang truy xuất dữ liệu đơn hàng...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <header className="flex flex-col gap-6">
        <div>
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight uppercase">
            Quản lý <span className="text-primary italic">Đơn hàng</span>
          </h1>
          <p className="text-slate-500 text-[14px] font-medium mt-1">
            Hệ thống ghi nhận <span className="text-primary font-black">{totalCount}</span> đơn hàng đã được khởi tạo.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-2xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, Họ tên, Số điện thoại hoặc Địa chỉ..."
            className="w-full pl-14 pr-6 py-5 rounded-[24px] border border-slate-100 bg-white shadow-sm focus:border-primary outline-none transition-all placeholder:text-slate-300 font-bold text-[15px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Orders List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {orders.map((order) => {
          const status = getStatusInfo(order.status);
          return (
            <div 
              key={order.id} 
              className="group bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden"
            >
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[60px] -z-0 group-hover:bg-primary/[0.03] transition-colors"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ORDER IDENTIFIER</span>
                    <span className="text-[20px] font-black text-slate-900 mono tracking-tighter">#{order.id.slice(0, 12)}</span>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black border-2 ${status.color}`}>
                    {status.icon}
                    <span className="tracking-wide uppercase">{status.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Customer Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-slate-900">{order.full_name}</p>
                        <p className="text-[12px] font-bold text-slate-400">{order.phone_number}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mt-0.5 group-hover:text-primary transition-colors">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-slate-500 leading-relaxed line-clamp-2 italic">
                          {order.shipping_address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-50 rounded-[24px] p-5 flex flex-col justify-center border border-slate-100/50 group-hover:bg-white transition-colors">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">TỔNG GIÁ TRỊ</span>
                    <p className="text-[28px] font-black text-primary text-center italic tracking-tight italic">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2 text-[11px] font-bold text-slate-400">
                      <Clock size={12} />
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    className="flex-1 bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white rounded-2xl h-12 font-black uppercase text-[12px] tracking-wider"
                    onClick={() => setSelectedOrder(order)}
                    leftIcon={<Eye size={16} />}
                  >
                    CHI TIẾT
                  </Button>
                  <Button
                    className="flex-1 bg-primary text-white shadow-lg shadow-primary/20 rounded-2xl h-12 font-black uppercase text-[12px] tracking-wider"
                    onClick={() => setStatusUpdateMode({ id: order.id, status: order.status })}
                  >
                    CẬP NHẬT
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          totalCount={totalCount}
          className="mt-12"
        />
      )}

      {/* Empty State */}
      {orders.length === 0 && !loading && (
        <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
          <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
            <Package size={48} className="text-slate-200" />
          </div>
          <h3 className="text-[20px] font-black text-slate-900 uppercase">Không tìm thấy Đơn hàng</h3>
          <p className="text-slate-400 font-bold mt-2">Dữ liệu truy xuất không khớp với từ khóa tìm kiếm của bạn.</p>
          <button 
            onClick={() => setSearchTerm("")}
            className="mt-6 text-primary font-black uppercase text-[13px] tracking-widest hover:underline"
          >
            LÀM MỚI BỘ LỌC
          </button>
        </div>
      )}

      {/* Order Detail View Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight italic">CHI TIẾT <span className="text-primary italic">ĐƠN HÀNG</span></h2>
                <p className="text-slate-400 font-bold text-[14px] mt-1">Mã tham chiếu: #{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-10 max-h-[60vh] overflow-y-auto space-y-8">
              {/* Product List */}
              <div>
                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">SẢN PHẨM ĐÃ ĐẶT</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100/50">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-primary border border-slate-100 shadow-sm">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="text-[15px] font-black text-slate-900">{item.products?.name || "Sản phẩm không còn tồn tại"}</p>
                          <p className="text-[12px] font-bold text-slate-400 uppercase">Đơn giá: {formatCurrency(item.price_at_purchase)}</p>
                        </div>
                      </div>
                      <p className="text-[16px] font-black text-slate-900 italic">
                        {formatCurrency(item.price_at_purchase * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phương thức thanh toán</p>
                  <p className="text-[15px] font-black text-slate-900 uppercase italic">
                    {selectedOrder.payment_method === 'cod' ? 'Thanh toán trực tiếp (COD)' : selectedOrder.payment_method}
                  </p>
                </div>
                <div className="md:text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng cộng thanh toán</p>
                  <p className="text-[36px] font-black text-primary italic leading-none">{formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-50">
              <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase text-[14px]" onClick={() => setSelectedOrder(null)}>
                ĐÓNG CỬA SỔ
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      <ConfirmationModal
        isOpen={!!statusUpdateMode}
        onClose={() => setStatusUpdateMode(null)}
        onConfirm={handleUpdateStatus}
        title="Cập nhật trạng thái"
        message="Vui lòng chọn trạng thái mới cho đơn hàng này."
        loading={isUpdating}
        type="info"
        confirmText="Xác nhận cập nhật"
      >
        <div className="mt-4 w-full">
          <AdminSelect
            label="Trạng thái đơn hàng"
            value={statusUpdateMode?.status || ""}
            onChange={(e) => setStatusUpdateMode(prev => prev ? { ...prev, status: e.target.value } : null)}
            options={[
              { value: "pending", label: "Chờ xác nhận" },
              { value: "confirmed", label: "Đã xác nhận" },
              { value: "shipping", label: "Đang giao hàng" },
              { value: "completed", label: "Đã hoàn thành" },
              { value: "cancelled", label: "Đã hủy" },
            ]}
          />
        </div>
      </ConfirmationModal>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
