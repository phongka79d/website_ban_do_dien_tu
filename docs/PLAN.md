# PLAN: Hệ thống Tìm kiếm & Gợi ý Sản phẩm thông minh

## Tổng quan
Xây dựng thanh tìm kiếm có khả năng phản hồi tức thì bằng cách gợi ý các sản phẩm liên quan từ cơ sở dữ liệu dựa trên từ khóa người dùng nhập.

## Các bước thực hiện
1. **Giai đoạn 1: Xử lý Logic Tìm kiếm (Performance Optimizer)**
    - Triển khai cơ chế **Debouncing** (trì hoãn 300-500ms) để không gửi quá nhiều request lên Supabase khi người dùng đang nhập nhanh.
    - Tối ưu truy vấn `searchProducts` để lấy tối đa 5-8 kết quả gợi ý.

2. **Giai đoạn 2: Xây dựng UI Gợi ý (Frontend Specialist)**
    - Tạo component `SearchSuggestions` hiển thị dưới thanh tìm kiếm.
    - Bao gồm: Ảnh sản phẩm, Tên, và Giá (với định dạng tiền tệ).
    - Sử dụng Framer Motion cho hiệu ứng xuất hiện mượt mà.

3. **Giai đoạn 3: Kết nối & Điều hướng (Backend Specialist)**
    - Xử lý sự kiện nhấn Enter để dẫn tới trang `/products?search=...`.
    - Xử lý sự kiện Click vào gợi ý để tới trang chi tiết `/product/[id]`.

4. **Giai đoạn 4: Kiểm thử (Test Engineer)**
    - Kiểm tra tốc độ phản hồi gợi ý.
    - Kiểm tra tính năng tìm kiếm trên Mobile.

## Chi tiết kế hoạch: C:\Users\ACER\.gemini\antigravity\brain\e5bea2a0-b699-4529-9e52-ed034f1bfe31\implementation_plan.md
