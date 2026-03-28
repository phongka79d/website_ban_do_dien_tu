import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "No DB connection" });

  const { data: { user }, error } = await supabase.auth.getUser();

  return NextResponse.json({
    message: "Đây là dữ liệu Server đang đọc từ bạn",
    userId: user?.id || "Chưa đăng nhập",
    email: user?.email || "Chưa đăng nhập",
    user_metadata: user?.user_metadata || null,
    app_metadata: user?.app_metadata || null,
    isAdmin: user?.user_metadata?.role === "admin" || user?.app_metadata?.role === "admin",
    error: error?.message || null,
  });
}
