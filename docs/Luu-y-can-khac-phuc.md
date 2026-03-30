# Danh sách Lưu ý & Khuyết điểm Cần Khắc phục (Architecture Trade-offs & Cons)

Dưới đây là các lỗ hổng và đánh đổi kiến trúc hiện tại của dự án Antigravity E-Commerce, cần có phương án xử lý khi dự án mở rộng quy mô (Scale-up).

## 1. Rủi ro "Rác Dữ liệu" (Orphaned Assets) Cloudinary
- **Vấn đề:** Ảnh (sản phẩm, avatar) được nạp trực tiếp qua Cloudinary. Tuy nhiên, khi xóa bản ghi (Record) trên bảng DB Supabase, file gốc trên Cloudinary không tự động bị xóa theo.
- **Tại sao nguy hiểm:** Nếu không xử lý, tài khoản Cloudinary sẽ phình to chứa toàn ảnh thừa không có link (Orphaned Items), gây lãng phí dung lượng và thấu chi (Over-billing).
- **Hướng khắc phục sau này:** Viết thêm một Server Action đặc biệt hoặc `Database Webhook` đẩy tín hiệu lên một API như `/api/webhook/cloudinary-cleanup` để gọi hàm Secret API (`cloudinary.uploader.destroy(public_id)`), xóa luôn file vật lý.

## 2. Nút thắt Cổ chai State Giỏ Hàng (Cart State Bottleneck)
- **Vấn đề:** Khung kiến trúc né tránh sử dụng Store Redux/Zustand để ưu tiên React Server Components (RSC). Nhưng Giỏ hàng đòi hỏi tính chất "Đồng bộ đa tuyến" (Multi-tree Syncing) ở phía Client: Bấm nút Mua ở màn hình A -> Icon Giỏ hàng ở Header B phải lập tức xoay nảy số lượng tức thời.
- **Tại sao nguy hiểm:** Dùng React Context bị kìm kẹp ở Layout gốc sẽ khiến toàn bộ cây Component re-render, gây chậm (Lag/Jank) cục bộ.
- **Hướng khắc phục sau này:** Cân nhắc nhượng bộ đặc cách, chỉ triển khai 1 Store siêu nhẹ (`Zustand`) làm nhiệm vụ đồng bộ cục bộ con số Giỏ Hàng, ép duy nhất icon trên Header làm Client Component.

## 3. Lỗ hổng Trạm gác Dữ liệu đầu vào (Input Validation Gap)
- **Vấn đề:** Các Server Actions hiện tại (`auth-actions.ts`, `profile-actions.ts`) bóc tách thẳng `formData.get()` rồi quăng tọt lên Supabase.
- **Tại sao nguy hiểm:** Vượt hàng rào chặn HTML ngoài giao diện là cực kì dễ. Hacker có thể đẩy dữ liệu mờ ám, Injection Script chọc thủng CSDL.
- **Hướng khắc phục sau này:** Áp dụng hệ sinh thái `Zod` kết hợp `next-safe-action` để ép khuôn dữ liệu cứng rắn: Số điện thoại phải đúng 10-11 số, Tên không được dính Script... trước khi gọi `supabase.from()`.

## 4. Ngục tù Bộ nhớ Đệm (App Router Cache Hell)
- **Vấn đề:** Phép thuật "Aggressive Caching" của Next.js 14/15 cố tình Cache gần như tất cả, bao gồm cả Snapshot ở tầng Client Router Cache. Chuyện này từng gây ra vụ "Slider Carousel đơ cứng" thần thánh mà ta vừa phải chống lưng qua.
- **Tại sao nguy hiểm:** Xung đột Router Activity khiến thao tác nhấp chuột đi lạc hoặc User thấy số liệu lỗi thời.
- **Hướng khắc phục sau này:** Kiểm soát chặt vòng đời Fetch/Router bằng `revalidatePath`, `useRouter().refresh()` hợp lý, và áp dụng Service Workers chống Cache đóng băng ở các màn tương tác phức tạp.

## 5. Vendor Lock-in (Kẹp dính Hệ sinh thái SaaS)
- **Vấn đề:** Codebase lệ thuộc mãnh liệt vào Trigger Database của PostgreSQL (Supabase) và hệ thống Edge của Vercel (`@supabase/ssr`).
- **Tại sao nguy hiểm:** Khách hàng không thể bê nguyên thùng Source này đẩy lên Host tự do hoặc Máy chủ tự kéo cáp (On-premise Nginx/MySQL/MERN Stack) mà không phải đập đi sửa Database.
- **Hướng khắc phục sau này:** Đây là sự Đánh đổi (Trade-off) đứt ruột đã được xác nhận để ăn điểm tốc độ Go-To-Market cực nhanh. Không có cách khắc phục ngoài việc đập hệ thống viết lại API REST bằng NestJS/Express độc lập.


Unit Testing: Thêm Jest/Vitest cho services/ để đảm bảo logic tính toán giỏ hàng luôn đúng.
E2E Testing: Sử dụng Playwright để test luồng Checkout từ lúc chọn hàng đến khi thanh toán.