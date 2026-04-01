import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CartService } from "@/services/cartService";
import CheckoutClient from "./checkout-client";

interface PageProps {
  searchParams: Promise<{ item_ids?: string }>;
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { item_ids } = await searchParams;

  if (!supabase) {
    redirect("/login?error=conn_failed");
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=auth_required");
  }

  // Lấy giỏ hàng thực tế từ Database
  const cartId = await CartService.getOrCreateCart(supabase, user.id);
  let cartItems = await CartService.fetchCartItems(supabase, cartId);

  // Lọc sản phẩm dựa trên ID được chọn từ URL. 2.0
  if (item_ids) {
    const selectedIds = item_ids.split(",");
    cartItems = cartItems.filter(item => selectedIds.includes(item.id));
  } else {
    // Nếu không có ID nào được truyền trực tiếp, quay lại giỏ hàng để chọn
    redirect("/cart");
  }

  if (cartItems.length === 0) {
    redirect("/cart");
  }

  return (
    <div className="bg-slate-50/50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Thanh toán</h1>
        <CheckoutClient user={user} initialItems={cartItems} />
      </div>
    </div>
  );
}
