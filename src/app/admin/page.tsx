import React from "react";
import { ProductService } from "@/services/productService";
import { OrderService } from "@/services/orderService";
import { createClient } from "@/utils/supabase/server";
import { formatCurrency, formatDate } from "@/utils/format";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import { ProductImage } from "@/components/common/ProductImage";
import { CompactNumber } from "@/components/common/CompactNumber";
import Link from "next/link";
import { ShoppingBag, Tag, ShoppingCart, DollarSign, Package, Clock, ChevronRight } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();
  if (!supabase) return null;

  // Fetch all required data
  const [products, brands, orders] = await Promise.all([
    ProductService.getProducts(supabase, false), // Fetch all, including inactive for stats
    ProductService.getBrands(supabase, false),
    OrderService.fetchAllOrders(supabase)
  ]);

  // Calculate stats
  const totalRevenue = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.total_amount, 0);

  const stats = [
    {
      label: "Tổng sản phẩm",
      value: products.length,
      icon: <Package className="text-blue-500" size={24} />,
      color: "bg-blue-50"
    },
    {
      label: "Thương hiệu",
      value: brands.length,
      icon: <Tag className="text-indigo-500" size={24} />,
      color: "bg-indigo-50"
    },
    {
      label: "Đơn hàng",
      value: orders.length,
      icon: <ShoppingCart className="text-amber-500" size={24} />,
      color: "bg-amber-50"
    },
    {
      label: "Doanh thu",
      value: formatCurrency(totalRevenue),
      icon: <DollarSign className="text-emerald-500" size={24} />,
      color: "bg-emerald-50"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Bảng <span className="text-primary italic">Thống kê</span>
        </h1>
        <p className="text-slate-500 font-medium">Chào mừng trở lại! Dưới đây là hiệu suất cửa hàng của bạn.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                {stat.icon}
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className="text-3xl font-black text-slate-900 truncate">
              {stat.label === "Doanh thu" ? (
                <CompactNumber 
                  value={orders
                    .filter(order => order.status === 'delivered')
                    .reduce((sum, order) => sum + order.total_amount, 0)} 
                />
              ) : (
                stat.value
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Latest Products */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                <ShoppingBag size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Sản phẩm mới</h2>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full">Gần đây</span>
          </div>

          <div className="divide-y divide-slate-50">
            {products.slice(0, 5).map((p) => (
              <Link 
                key={p.id} 
                href={`/admin/products/${p.id}/edit`}
                className="py-4 flex justify-between items-center group/item hover:bg-slate-50/50 hover:pl-2 rounded-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0 overflow-hidden flex items-center justify-center group-hover/item:border-primary/20 transition-colors">
                    <ProductImage 
                      src={p.image_url} 
                      alt={p.name} 
                      width={48} 
                      height={48} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 group-hover/item:text-primary transition-colors line-clamp-1">{p.name}</p>
                    <p className="text-xs font-black text-primary mt-0.5">{formatCurrency(p.price)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500 tracking-tighter group-hover/item:bg-white group-hover/item:text-slate-900 transition-colors">
                    {p.category_slug}
                  </span>
                  <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Orders */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <Clock size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Đơn hàng mới</h2>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full">Gần đây</span>
          </div>

          <div className="divide-y divide-slate-50">
            {orders.slice(0, 5).map((order) => (
              <Link 
                key={order.id} 
                href="/admin/orders"
                className="py-4 flex justify-between items-center group/item hover:bg-slate-50/50 hover:pl-2 rounded-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shrink-0 capitalize font-black text-xl group-hover/item:text-primary group-hover/item:border-primary/20 transition-all">
                    {order.payment_method?.[0] || 'O'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 group-hover/item:text-primary transition-colors">#{order.id.slice(0, 8)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1.5">
                    <p className="text-sm font-black text-slate-900">{formatCurrency(order.total_amount)}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
