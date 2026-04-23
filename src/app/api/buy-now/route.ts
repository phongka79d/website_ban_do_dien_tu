import { createClient } from "@/utils/supabase/server";
import { OrderService } from "@/services/orderService";
import { NextResponse } from "next/server";
import { CartItem, Product } from "@/types/database";

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
    const body: {
      productId: string;
      quantity?: number;
      shippingAddress: string;
      phoneNumber: string;
      paymentMethod: string;
    } = await request.json();
    
    const { productId, quantity: rawQuantity = 1, shippingAddress, phoneNumber, paymentMethod } = body;

    // Validation cơ bản
    if (!productId || !shippingAddress || !phoneNumber || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin sản phẩm hoặc thông tin giao hàng" },
        { status: 400 }
      );
    }

    // Kiểm tra tính hợp lệ của địa chỉ giao hàng
    if (typeof shippingAddress !== "string" || shippingAddress.trim().length < 12) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập địa chỉ giao hàng rõ ràng (ít nhất 12 ký tự)" },
        { status: 400 }
      );
    }

    if (shippingAddress.trim().length > 300) {
      return NextResponse.json(
        { success: false, error: "Địa chỉ quá dài, vui lòng rút gọn lại (tối đa 300 ký tự)" },
        { status: 400 }
      );
    }

    // Kiểm tra phương thức thanh toán
    const allowedPaymentMethods = ["cod", "card"];
    if (!allowedPaymentMethods.includes(String(paymentMethod).toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Phương thức thanh toán không hợp lệ (Chỉ hỗ trợ COD hoặc Card)" },
        { status: 400 }
      );
    }

    // Kiểm tra số lượng
    const quantity = Number(rawQuantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: "Số lượng sản phẩm không hợp lệ" },
        { status: 400 }
      );
    }

    // Kiểm tra định dạng số điện thoại (9-11 chữ số, bắt đầu bằng 0)
    const phoneRegex = /^0\d{8,10}$/;
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
    const mockItems: CartItem[] = [{
      id: "", // Không quan trọng vì RPC sẽ tạo OrderItem mới
      cart_id: "", 
      product_id: productId,
      quantity: quantity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      products: product as Product
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

  } catch (error: unknown) {
    console.error("API Error [/api/buy-now]:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Lỗi hệ thống khi thanh toán mua ngay"
      },
      { status: 500 }
    );
  }
}

