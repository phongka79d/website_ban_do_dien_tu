import { createClient } from "@/utils/supabase/server";
import { OrderService } from "@/services/orderService";
import { NextResponse } from "next/server";

/**
 * API Route: Tra cứu thông tin đơn hàng công khai
 * GET /api/track-order?orderId=...
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!orderId || !orderId.trim() || !uuidRegex.test(orderId)) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập mã đơn hàng đúng định dạng" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Hệ thống chưa sẵn sàng kết nối cơ sở dữ liệu" },
        { status: 500 }
      );
    }

    // Tra cứu đơn hàng theo thông tin công khai (Mã UUID)
    // Theo yêu cầu của USER: "Ai cũng có thể tra" và "Cho phép hiển thị SĐT/Địa chỉ"
    const { data, error } = await OrderService.fetchOrderByPublicInfo(supabase, orderId);

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: "Không tìm thấy đơn hàng"
        },
        { status: 404 }
      );
    }

    // Trả về dữ liệu đầy đủ bao gồm items, status và thông tin giao hàng
    return NextResponse.json({
      success: true,
      message: "Truy vấn đơn hàng thành công",
      data: {
        id: data.id,
        status: data.status,
        total_amount: data.total_amount,
        full_name: data.profiles?.full_name || "Khách hàng",
        phone_number: data.phone_number,
        shipping_address: data.shipping_address,
        payment_method: data.payment_method,
        created_at: data.created_at,
        order_items: data.order_items
      }
    });

  } catch (error: any) {
    console.error("API Error [/api/track-order]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Lỗi hệ thống khi tra cứu dữ liệu"
      },
      { status: 500 }
    );
  }
}
