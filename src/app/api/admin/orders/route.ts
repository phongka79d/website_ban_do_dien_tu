import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService';
import ExcelJS from 'exceljs';

/**
 * API Quản trị Đơn hàng - Chỉ dành cho Admin/Staff
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Lỗi khởi tạo kết nối Database' }, { status: 500 });
    }

    // 1. Xác minh quyền hạn (Auth + Profile check)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'staff') {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập dữ liệu này' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const isExport = searchParams.get('export') === 'true';

    // --- LOGIC EXCEL EXPORT (Dùng ExcelJS để hỗ trợ Wrap Text/Xuống dòng) ---
    if (isExport) {
      const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1 + '');
      const year = parseInt(searchParams.get('year') || new Date().getFullYear() + '');

      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 1).toISOString();

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .gte('created_at', startDate)
        .lt('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      let resultData = orders || [];
      
      // Application-layer join cho Tên Khách Hàng
      if (resultData.length > 0) {
        const userIds = [...new Set(resultData.map(o => o.user_id).filter(Boolean))];
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
          if (profilesData) {
            const profileMap = profilesData.reduce((acc, p) => {
              acc[p.id] = p.full_name || "Khách hàng không tên";
              return acc;
            }, {} as Record<string, string>);
            resultData = resultData.map(order => ({
              ...order,
              customer_name: profileMap[order.user_id] || "Khách hàng không tên"
            }));
          }
        }
      }

      // Khởi tạo Workbook chuyên nghiệp với ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`DonHang_T${month}_${year}`);

      // Định nghĩa các Header và độ rộng cột
      worksheet.columns = [
        { header: "Mã Đơn Hàng", key: "id", width: 38 },
        { header: "Tên Khách Hàng", key: "customer", width: 25 },
        { header: "Số Điện Thoại", key: "phone", width: 15 },
        { header: "Địa Chỉ Giao Hàng", key: "address", width: 45 },
        { header: "Trạng Thái", key: "status", width: 15 },
        { header: "Tổng Tiền (VNĐ)", key: "total", width: 15 },
        { header: "Ngày Tạo Đơn", key: "created", width: 22 },
        { header: "Chi Tiết Sản Phẩm", key: "details", width: 60 },
      ];

      // Đẩy dữ liệu vào rows
      resultData.forEach(order => {
        const row = worksheet.addRow({
          id: order.id,
          customer: order.customer_name || "Khách hàng",
          phone: order.phone_number || "",
          address: order.shipping_address || "",
          status: order.status === 'pending' ? 'Chờ xác nhận' :
                  order.status === 'processing' ? 'Đang xử lý' :
                  order.status === 'shipped' ? 'Đang giao' :
                  order.status === 'delivered' ? 'Đã giao' :
                  order.status === 'cancelled' ? 'Đã hủy' : order.status,
          total: order.total_amount,
          created: new Date(order.created_at).toLocaleString('vi-VN'),
          details: Array.isArray(order.order_items) 
                  ? order.order_items.map((item: any) => `- ${item.products?.name || 'Sản phẩm'} (x${item.quantity})`).join('\n') 
                  : ""
        });

        // Kỹ thuật Wrap Text: Bật tính năng tự động xuống dòng cho cột chi tiết sản phẩm (Cột thứ 8)
        row.getCell(8).alignment = { wrapText: true, vertical: 'top' };
      });

      // Style cho Header (Cho đẹp hơn)
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { horizontal: 'center' };

      const buffer = await workbook.xlsx.writeBuffer();

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="DanhSachDonHang_T${month}_${year}.xlsx"`,
        }
      });
    }

    // --- LOGIC SEARCH HIỆN TẠI ---
    const query = searchParams.get('q') || '';
    const filter = searchParams.get('filter') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const { data, count } = await OrderService.searchOrders(supabase, query, filter, page, pageSize);

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
