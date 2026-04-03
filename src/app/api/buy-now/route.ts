import { createClient } from "@/utils/supabase/server";
import { OrderService } from "@/services/orderService";
import { NextResponse } from "next/server";

/**
 * API Route: Mua ngay (Buy Now - Bỏ qua giỏ hàng)
 * POST /api/buy-now
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

    // 1. Xác thực người dùng
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Vui lòng đăng nhập để thực hiện mua sản phẩm" },
        { status: 401 }
      );
    }

    const userId = user.id;

    // 2. Lấy dữ liệu từ Request Body
    const body = await request.json();
    const { productId, quantity = 1, shippingAddress, phoneNumber, paymentMethod } = body;

    // Validation cơ bản
    if (!productId || !shippingAddress || !phoneNumber || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin sản phẩm hoặc thông tin giao hàng" },
        { status: 400 }
      );
    }

    // Kiểm tra định dạng số điện thoại (9-11 chữ số)
    const phoneRegex = /^\d{9,11}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: "Số điện thoại không hợp lệ (Phải từ 9-11 chữ số)" },
        { status: 400 }
      );
    }

    // 3. Truy vấn thông tin sản phẩm (Giá & Tồn kho)
    const { data: product, error: pError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (pError || !product) {
      return NextResponse.json(
        { success: false, error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    // 4. Kiểm tra tồn kho tại thời điểm hiện tại
    if (product.stock_quantity < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: `Số lượng vượt quá tồn kho (Hiện còn: ${product.stock_quantity})`
        },
        { status: 400 }
      );
    }

    // 5. Tính toán Tổng tiền
    const totalAmount = product.price * quantity;

    // 6. Giả lập cấu trúc CartItem để tái sử dụng OrderService
    const mockItems: any[] = [{
      product_id: productId,
      quantity: quantity,
      products: product
    }];

    // 7. Khởi tạo quy trình Tạo đơn hàng Mua ngay (Atomic RPC)
    const { data: order, error: orderError } = await OrderService.createOrder(supabase, {
      userId,
      items: mockItems,
      totalAmount,
      shippingAddress,
      phoneNumber,
      paymentMethod
    });

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: orderError?.message || "Lỗi khi khởi tạo đơn mua ngay. Vui lòng thử lại"
        },
        { status: 500 }
      );
    }

    // 8. Trả về kết quả
    return NextResponse.json({
      success: true,
      message: "Đặt hàng mua ngay thành công",
      data: {
        orderId: order.id,
        totalAmount,
        status: order.status
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("API Error [/api/buy-now]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi hệ thống khi thanh toán mua ngay"
      },
      { status: 500 }
    );
  }
}
 
