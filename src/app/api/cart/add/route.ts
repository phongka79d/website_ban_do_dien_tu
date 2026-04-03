import { createClient } from "@/utils/supabase/server";
import { CartService } from "@/services/cartService";
import { NextResponse } from "next/server";

/**
 * API Route: Thêm sản phẩm vào giỏ hàng
 * POST /api/cart/add
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase client not initialized" },
        { status: 500 }
      );
    }

    // Lấy thông tin User từ Session (Cookies)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Vui lòng đăng nhập trước khi thực hiện" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    // Validate input
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Thiếu ID sản phẩm" },
        { status: 400 }
      );
    }

    const userId = user.id;

    // 1. Lấy hoặc tạo giỏ hàng cho người dùng
    const cartId = await CartService.getOrCreateCart(supabase, userId);

    // 2. Thêm sản phẩm vào giỏ hàng
    const itemId = await CartService.addToCart(supabase, cartId, productId, quantity);

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy sản phẩm" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thêm sản phẩm vào giỏ hàng thành công",
      data: {
        itemId,
        cartId,
        productId,
        quantity
      }
    });

  } catch (error: any) {
    console.log("Cart API Error Detail:", error.message);

    // Xác định mã lỗi HTTP dựa trên nội dung lỗi
    let status = 500;
    const errorMessage = error.message || "Lỗi";

    if (
      errorMessage.includes("không đủ") ||
      errorMessage.includes("hết hàng") ||
      errorMessage.includes("không tồn tại")
    ) {
      status = 400; // Lỗi nghiệp vụ (Client error/Validation)
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status }
    );
  }
}
