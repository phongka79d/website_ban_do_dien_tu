# Kế hoạch Chức năng: Hệ thống Antigravity E-commerce

Dựa trên cấu trúc hiện tại của dự án (Next.js 16, Supabase, Tailwind 4), dưới đây là lộ trình phát triển chức năng được phân cấp theo độ ưu tiên.

## 1. Chức năng Phải có (Must-have / MVP)
*Đây là các chức năng cốt lõi để hệ thống có thể vận hành và thực hiện giao dịch cơ bản.*

### Hệ thống Người dùng & Bảo mật
- [V] **Xác thực (Authentication):** Đã xong Email OTP, Phone Auth, Password.
- [V] **Quản lý Quyền (RBAC & isActive):** Đã xong Role Admin và tính năng khóa tài khoản Real-time.

### Luồng Mua hàng Cơ bản
- [V] **Danh mục & Sản phẩm:** Hiển thị danh sách từ Database lên Trang chủ (đã có `ProductList`).
- [ ] **Chi tiết Sản phẩm:** Hiển thị thông số kỹ thuật (JSONB), mô tả và hình ảnh Cloudinary.
- [ ] **Giỏ hàng (Shopping Cart):** Thêm/Sửa/Xóa sản phẩm, tính tổng tiền (Local Storage sync với Supabase).
- [ ] **Thanh toán (Checkout):** Nhập thông tin giao hàng và chọn phương thức thanh toán cơ bản (COD/Chuyển khoản).

### Quản trị (Admin)
- [V] **Quản lý Sản phẩm:** CRUD sản phẩm kèm SpecManager cho JSONB (Đã có base).
- [ ] **Quản lý Banner:** CRUD cho Carousel trang chủ (Đã có base).
- [ ] **Quản lý Đơn hàng:** Xem và cập nhật trạng thái đơn hàng.

---

## 2. Chức năng Bình thường (Should-have)
*Các chức năng tiêu chuẩn để tăng tính chuyên nghiệp và sự tin cậy.*

### Trải nghiệm Người dùng
- [ ] **Bộ lọc Nâng cao:** Lọc theo giá, thương hiệu, và thuộc tính kỹ thuật động (specs).
- [ ] **Tìm kiếm:** Tìm kiếm sản phẩm theo tên hoặc mã SKU.
- [ ] **Lịch sử Đơn hàng:** Người dùng xem lại các đơn hàng đã mua và trạng thái vận chuyển.
- [ ] **Đánh giá & Nhận xét:** Cho phép người dùng đánh giá sản phẩm sau khi mua.

### Chăm sóc & Giữ chân
- [ ] **Sản phẩm Yêu thích (Wishlist):** Lưu sản phẩm để xem sau.
- [ ] **Quản lý Profile:** Cập nhật thông tin cá nhân và sổ địa chỉ.
- [ ] **Thông báo (Toast/Email):** Thông báo trạng thái đơn hàng hoặc xác nhận thanh toán thành công.

---

## 3. Chức năng Chi tiết (Nice-to-have / Premium)
*Các tính năng làm cho người dùng cảm thấy tiện lợi và trải nghiệm "Wow".*

### Tính năng Thông minh (AI & Logic)
- [ ] **Gợi ý Sản phẩm:** Hiển thị "Sản phẩm tương đương" hoặc "Có thể bạn cũng thích" dựa trên specs.
- [ ] **So sánh Sản phẩm:** Bảng so sánh chi tiết thông số kỹ thuật giữa 2-3 sản phẩm.
- [ ] **Tìm kiếm Thông minh:** Autocomplete và tìm kiếm dựa trên từ khóa liên quan.

### Tiện ích Nâng cao
- [ ] **Dark/Light Mode Toggle:** Chuyển đổi giao diện (đã có hệ màu Magenta/Indigo làm nền tảng).
- [ ] **Mã Giảm giá (Coupons/Vouchers):** Hệ thống tạo và áp dụng mã khuyến mãi.
- [ ] **Live Chat:** Tích hợp công cụ tư vấn khách hàng trực tuyến.
- [ ] **Theo dõi Hành trình Đơn hàng:** Bản đồ hoặc timeline chi tiết tiến trình vận chuyển.

---

## Ghi chú về Kiến trúc (Architecture)
- **Tech-spec focus:** Tận dụng tối đa kiểu dữ liệu JSONB trong Postgres để hiển thị Specs linh hoạt.
- **Premium UI:** Duy trì phong cách Glassmorphism và layout 50/50 như đã định hướng trong Carousel.
- **Stability:** Đảm bảo `ServiceWorker` hoạt động tốt để tránh lỗi Carousel freeze trong quá trình chuyển trang.
