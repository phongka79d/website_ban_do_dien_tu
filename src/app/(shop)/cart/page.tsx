import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CartClient from "./cart-client";

export default async function CartPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?error=conn_failed");
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Chuyển hướng ngay lập tức ở phía Server nếu chưa đăng nhập
    redirect("/login?error=auth_required");
  }

  // Nếu đã đăng nhập, render phần logic giỏ hàng phía Client
  return <CartClient />;
}
