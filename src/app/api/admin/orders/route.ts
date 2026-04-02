import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService';

/**
 * API Quản trị Đơn hàng - Chỉ dành cho Admin
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Lỗi khởi tạo kết nối Database' }, { status: 500 });
    }

    // 1. Xác minh quyền hạn Admin (Auth + Profile check)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập dữ liệu này' }, { status: 403 });
    }

    // 2. Lấy Query Parameters để tìm kiếm và phân trang
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // 3. Truy vấn đơn hàng toàn hệ thống (Bằng hàm searchOrders có sẵn)
    const { data, count } = await OrderService.searchOrders(supabase, query, page, pageSize);

    return NextResponse.json({
      orders: data,
      totalCount: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    }, { status: 200 });

  } catch (error: any) {
    console.error('Admin Orders API Error:', error.message);
    return NextResponse.json({ error: 'Lỗi máy chủ khi xử lý đơn hàng' }, { status: 500 });
  }
}
