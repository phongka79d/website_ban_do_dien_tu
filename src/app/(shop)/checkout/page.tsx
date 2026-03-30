import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CartService } from "@/services/cartService";
import CheckoutClient from "./checkout-client";

export default async function CheckoutPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?error=conn_failed");
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=auth_required");
  }

  // Lấy giỏ hàng thực tế từ Database để đảm bảo tính chính xác
  const cartId = await CartService.getOrCreateCart(supabase, user.id);
  const cartItems = await CartService.fetchCartItems(supabase, cartId);

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
