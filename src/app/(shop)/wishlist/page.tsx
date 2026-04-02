import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import WishlistClient from "./wishlist-client";

export default async function WishlistPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect(`/login?error=conn_failed&returnTo=${encodeURIComponent("/wishlist")}`);
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?error=auth_required&returnTo=${encodeURIComponent("/wishlist")}`);
  }

  return <WishlistClient />;
}
