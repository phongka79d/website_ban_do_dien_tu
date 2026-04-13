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
  ListFilter,
  Truck,
  RotateCcw,
  XCircle,
  Hash,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import NotificationModal from "@/components/common/NotificationModal";
import { useAdminSearch } from "@/hooks/useAdminSearch";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency, formatDate } from "@/utils/format";
import { AdminSelect } from "@/components/admin/AdminSelect";

export default function AdminOrdersPage() {
  const supabase = createClient();

  const [filterType, setFilterType] = useState<string>("all");
  const [exportMonth, setExportMonth] = useState((new Date().getMonth() + 1).toString());
  const [exportYear, setExportYear] = useState(new Date().getFullYear().toString());
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      window.open(`/api/admin/orders?export=true&month=${exportMonth}&year=${exportYear}`, '_blank');
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsExporting(false), 2000);
    }
  };

  // Search and Pagination logic - Chuyển sang dùng API tập trung 2.0
  const searchFn = useCallback(async (_client: any, query: string, page: number, pageSize: number) => {
    try {
      const resp = await fetch(`/api/admin/orders?q=${encodeURIComponent(query)}&filter=${filterType}&page=${page}&pageSize=${pageSize}`);
      const result = await resp.json();

      if (!resp.ok) throw new Error(result.error || "Lỗi tải đơn hàng");

      return {
        data: result.orders || [],
        count: result.totalCount || 0
      };
    } catch (error: any) {
      console.error("Fetch Admin Orders failed:", error.message);
      return { data: [], count: 0 };
    }
  }, [filterType]);

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
  const [tempStatus, setTempStatus] = useState<string>("");
  const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'CHỜ XÁC NHẬN', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={14} /> };
      case 'processing': return { label: 'ĐÃ XÁC NHẬN', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: <CheckCircle2 size={14} /> };
      case 'shipped': return { label: 'ĐANG GIAO HÀNG', color: 'bg-sky-50 text-sky-600 border-sky-100', icon: <Truck size={14} /> };
      case 'delivered': return { label: 'ĐÃ HOÀN THÀNH', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={14} /> };
      case 'cancelled': return { label: 'ĐÃ HỦY', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: <XCircle size={14} /> };
      default: return { label: 'KHÔNG XÁC ĐỊNH', color: 'bg-slate-50 text-slate-600 border-slate-100', icon: <Hash size={14} /> };
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !tempStatus || !supabase) return;

    setIsUpdating(true);
    const { success, error } = await OrderService.updateOrderStatus(supabase, selectedOrder.id, tempStatus);

    if (success) {
      setNotification({
        isOpen: true,
        title: "Thành công",
        message: `Trạng thái đơn hàng #${selectedOrder.id.slice(0, 8)} đã được cập nhật thành công.`,
        type: "success"
      });
      fetchOrders();
      // Keep modal open but update local order status if needed (or just close to refresh list)
      // setSelectedOrder(null); 
    } else {
      setNotification({
        isOpen: true,
        title: "Lỗi cập nhật",
        message: error?.message || "Không thể cập nhật trạng thái đơn hàng.",
        type: "error"
      });
    }

    setIsUpdating(false);
  };

  // Render logic optimized for UX: Keep header visible while loading

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

        {/* Search Bar & Filter & Export */}
        <div className="flex flex-col xl:flex-row w-full gap-4 items-center">
          <div className="flex flex-col sm:flex-row w-full xl:w-2/3 gap-4 group">
          <div className="relative min-w-[200px] shrink-0">
            <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              title="Bộ lọc tìm kiếm"
              className="w-full pl-12 pr-10 py-5 rounded-[24px] border border-slate-100 bg-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-[14px] text-slate-700 appearance-none cursor-pointer"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Tất cả Thông tin</option>
              <option value="id">Mã đơn hàng (UUID)</option>
              <option value="phone">Số điện thoại</option>
              <option value="name">Tên khách hàng</option>
              <option value="address">Khu vực / Địa chỉ</option>
            </select>
            <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" size={16} />
          </div>
          
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder={
                filterType === "id" ? "Vui lòng nhập chính xác Mã UUID..." :
                filterType === "phone" ? "Nhập Số điện thoại..." :
                filterType === "name" ? "Nhập tên người nhận..." :
                filterType === "address" ? "Tìm theo Phường, Quận, Thành phố..." :
                "Tìm theo Mã đơn, Họ tên, SĐT hoặc Địa chỉ..."
              }
              className="w-full pl-14 pr-6 py-5 rounded-[24px] border border-slate-100 bg-white shadow-sm focus:border-primary outline-none transition-all placeholder:text-slate-300 font-bold text-[15px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

          {/* Export Excel Module */}
          <div className="flex flex-row w-full xl:w-1/3 gap-2 bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm">
            <select
              className="flex-1 py-3 px-4 rounded-[16px] bg-slate-50 text-slate-700 font-bold text-[14px] outline-none hover:bg-slate-100 transition-colors cursor-pointer appearance-none"
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
            
            <select
              className="flex-1 py-3 px-4 rounded-[16px] bg-slate-50 text-slate-700 font-bold text-[14px] outline-none hover:bg-slate-100 transition-colors cursor-pointer appearance-none"
              value={exportYear}
              onChange={(e) => setExportYear(e.target.value)}
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>

            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className={`flex shrink-0 items-center justify-center gap-2 px-5 py-3 rounded-[16px] font-black text-[13px] transition-all
                ${isExporting 
                  ? 'bg-primary/50 cursor-not-allowed text-white' 
                  : 'bg-primary text-white hover:bg-primary/90 hover:scale-[0.98]'
                }`}
              title="Xuất bảng Excel"
            >
              <Download size={16} className={isExporting ? 'animate-bounce' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* Orders List - Vertical & Simplified Style 2.0 */}
      <div className="flex flex-col gap-3 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-[2px] rounded-[40px] border border-slate-100">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 font-black animate-pulse text-[12px] uppercase tracking-widest">Đang cập nhật danh sách...</p>
          </div>
        ) : (
          <>
            {orders.map((order) => {
              const status = getStatusInfo(order.status);
              return (
                <div
                  key={order.id}
                  className="group bg-white rounded-3xl border border-slate-100 p-4 pl-6 pr-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
                >
                  {/* Left Part: ID & Time */}
                  <div className="flex items-center gap-6 min-w-[200px]">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Hash size={18} />
                    </div>
                    <div>
                      <span className="text-[14px] font-black text-slate-900 block tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                        <Clock size={10} />
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Middle Part: Customer Info - Refined 2.0 */}
                  <div className="flex-1 flex items-center gap-8 px-6 border-l border-slate-50 hidden md:flex min-w-0">
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <User size={14} />
                      </div>
                      <div className="max-w-[150px]">
                        <p className="text-[13px] font-black text-slate-800 truncate">{order.profiles?.full_name || "Khách hàng không tên"}</p>
                        <p className="text-[11px] font-bold text-slate-400">{order.phone_number}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Part: Value & Status & Actions */}
                  <div className="flex items-center gap-8">
                    {/* Amount */}
                    <div className="text-right min-w-[140px]">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">TỔNG GIÁ TRỊ</span>
                      <span className="text-[18px] font-black text-slate-900 italic tracking-tighter">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black border ${status.color} min-w-[130px] justify-center`}>
                      {status.icon}
                      <span className="tracking-wide uppercase">{status.label}</span>
                    </div>

                    {/* Vertical Separator */}
                    <div className="h-10 w-[1px] bg-slate-100 hidden md:block" />

                    {/* Unified Action Button */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          // Set initial status for update select
                          setTempStatus(order.status);
                        }}
                        className="px-6 h-12 rounded-2xl bg-primary text-white text-[12px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all group"
                      >
                        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <Eye size={16} />
                        </div>
                        XỬ LÝ ĐƠN
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty State - Di chuyển vào trong fragment của list để không hiển thị đè lên loading */}
            {orders.length === 0 && (
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
          </>
        )}
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


      {/* Order Detail View Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            {/* Header - Fixed */}
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight italic">CHI TIẾT <span className="text-primary italic">ĐƠN HÀNG</span></h2>
                <p className="text-slate-400 font-bold text-[12px] mt-1">Mã tham chiếu: #{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Customer & Shipping Info 2.0 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <User size={12} className="text-primary" /> THÔNG TIN KHÁCH HÀNG
                  </h3>
                  <div>
                    <p className="text-[15px] font-black text-slate-900">{selectedOrder.profiles?.full_name || "Khách hàng không tên"}</p>
                    <p className="text-[13px] font-bold text-slate-500">{selectedOrder.phone_number}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <MapPin size={12} className="text-primary" /> ĐỊA CHỈ GIAO HÀNG
                  </h3>
                  <p className="text-[12px] font-medium text-slate-600 leading-relaxed italic">
                    {selectedOrder.shipping_address}
                  </p>
                </div>
              </div>

              {/* Product List */}
              <div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">SẢN PHẨM ĐÃ ĐẶT ({selectedOrder.order_items.length})</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-primary border border-slate-100 shadow-sm text-sm">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="text-[14px] font-black text-slate-900 line-clamp-1">{item.products?.name || "Sản phẩm không tồn tại"}</p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase">Đơn giá: {formatCurrency(item.price_at_purchase)}</p>
                        </div>
                      </div>
                      <p className="text-[14px] font-black text-slate-900 italic shrink-0">
                        {formatCurrency(item.price_at_purchase * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Phương thức thanh toán</p>
                  <p className="text-[13px] font-black text-slate-900 uppercase italic">
                    {selectedOrder.payment_method === 'cod' ? 'Thanh toán trực tiếp (COD)' : selectedOrder.payment_method}
                  </p>
                </div>
                <div className="md:text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng cộng thanh toán</p>
                  <p className="text-[28px] font-black text-primary italic leading-none">{formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              </div>
            </div>

            {/* Footer - Status Update Area - Fixed/Sticky at the bottom */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
              <div className="flex flex-col gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <RotateCcw size={12} className="text-primary" /> CẬP NHẬT TRẠNG THÁI MỚI
                  </h3>
                  <div className="flex flex-col md:flex-row items-end gap-3">
                    <div className="flex-1 w-full">
                      <AdminSelect
                        label="Chọn trạng thái đơn hàng"
                        value={tempStatus}
                        onChange={(e) => setTempStatus(e.target.value)}
                        options={[
                          { value: "pending", label: "Chờ xác nhận" },
                          { value: "processing", label: "Đã xác nhận (Đang xử lý)" },
                          { value: "shipped", label: "Đang giao hàng" },
                          { value: "delivered", label: "Đã hoàn thành (Đã giao)" },
                          { value: "cancelled", label: "Đã hủy" },
                        ]}
                      />
                    </div>
                    <Button
                      className="h-[48px] px-6 bg-primary text-white font-black uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                      onClick={handleUpdateStatus}
                      isLoading={isUpdating}
                    >
                      CẬP NHẬT
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase text-[12px] tracking-[0.2em] shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all"
                  onClick={() => setSelectedOrder(null)}
                >
                  ĐÓNG CHI TIẾT
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
