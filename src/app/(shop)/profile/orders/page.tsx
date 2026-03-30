import { createClient } from "@/utils/supabase/server";
import { OrderService } from "@/services/orderService";
import { ShoppingBag } from "lucide-react";
import OrderCard from "./OrderCard";

export default async function OrdersPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Hệ thống đang bảo trì, vui lòng quay lại sau.</p>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Vui lòng đăng nhập để xem đơn hàng.</p>
      </div>
    );
  }

  const orders = await OrderService.fetchUserOrders(supabase, user.id);

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col items-center justify-center py-32 px-4 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
          <ShoppingBag size={48} className="text-slate-200" />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2">Chưa có đơn hàng nào</h2>
        <p className="text-slate-500 text-sm max-w-sm">
          Bạn chưa thực hiện giao dịch nào. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi nhé!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {orders.map((order: any) => (
        <OrderCard key={order.id} order={order} userId={user.id} />
      ))}
    </div>
  );
}
