import React from "react";
import { Clock, Package, Truck, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";

export type OrderStatus = "pending" | "processing" | "shipping" | "shipped" | "delivered" | "completed" | "cancelled";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export const statusConfigs: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Chờ xác nhận", color: "text-amber-500 bg-amber-50 border-amber-100", icon: Clock },
  processing: { label: "Đang xử lý", color: "text-blue-500 bg-blue-50 border-blue-100", icon: Package },
  shipping: { label: "Đang chuẩn bị", color: "text-indigo-500 bg-indigo-50 border-indigo-100", icon: Truck },
  shipped: { label: "Đang giao hàng", color: "text-indigo-500 bg-indigo-50 border-indigo-100", icon: Truck },
  delivered: { label: "Giao thành công", color: "text-emerald-500 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
  completed: { label: "Hoàn tất", color: "text-emerald-500 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
  cancelled: { label: "Đã hủy", color: "text-red-500 bg-red-50 border-red-100", icon: XCircle },
};

export default function OrderStatusBadge({ status, className, showIcon = true }: OrderStatusBadgeProps) {
  const config = statusConfigs[status] || { 
    label: status, 
    color: "text-slate-500 bg-slate-50 border-slate-100", 
    icon: AlertCircle 
  };
  
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
      config.color,
      className
    )}>
      {showIcon && <Icon size={12} className="shrink-0" />}
      {config.label}
    </span>
  );
}
