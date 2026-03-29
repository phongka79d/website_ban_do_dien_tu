# PLAN: Chuyển đổi Trang Giỏ hàng & Hiệu ứng Bay (Flying Animation)

Thay đổi toàn diện luồng người dùng từ: "Thêm vào giỏ -> Mở Drawer" sang "Thêm vào giỏ -> Hiệu ứng bay truyền cảm hứng -> Vào trang Giỏ hàng riêng để Checkout".

## Mục tiêu
1.  **✅ Loại bỏ CartDrawer**: Không còn thanh trượt từ bên phải.
2.  **✅ Flying Animation**: Sử dụng Framer Motion hoặc CSS Keyframes để mô phỏng sản phẩm bay từ vị trí nút "Mua" vào Icon giỏ hàng trên Header.
3.  **✅ Dedicated Cart Page**: Xây dựng `app/(shop)/cart/page.tsx` với bố cục 2 cột chuyên nghiệp.(Nhớ sử dụng các Component có thể reuse thay vì tạo ra component mới)
4.  **✅ Tối giản ProductCard**: Gỡ bỏ nút mua nhanh, tập trung dẫn khách vào trang chi tiết.

## User Review Required
> [!IMPORTANT]
> - **Hiệu ứng Bay**: Em sẽ sử dụng ảnh sản phẩm thu nhỏ để làm hiệu ứng bay. Bác cần đảm bảo có `Framer Motion` trong dự án (Em sẽ kiểm tra và cài nếu thiếu).
> - **Trang Giỏ hàng**: Sẽ sử dụng layout Option A (Cột trái: List sản phẩm, Cột phải: Tổng tiền & Nút thanh toán).

## Các thay đổi dự kiến

### 1. 📂 Core Logic & Assets
- **[NEW] [cart/page.tsx](file:///c:/Users/ACER/Next-JS-Project/web_ban_do_dien_tu/src/app/(shop)/cart/page.tsx)**: Trang chủ của giỏ hàng.
- **[MODIFY] [Header.tsx](file:///c:/Users/ACER/Next-JS-Project/web_ban_do_dien_tu/src/components/Header.tsx)**: Gắn ID hoặc Ref vào icon giỏ hàng để làm điểm đích (Target) cho hiệu ứng bay.

### 2. 📂 Components UI
- **[MODIFY] [AddToCartButton.tsx](file:///c:/Users/ACER/Next-JS-Project/web_ban_do_dien_tu/src/components/cart/AddToCartButton.tsx)**: Thay đổi logic `onClick`. Thay vì `setIsOpen(true)`, nó sẽ kích hoạt animation "bay".
- **[MODIFY] [ProductCard.tsx](file:///c:/Users/ACER/Next-JS-Project/web_ban_do_dien_tu/src/components/ProductCard.tsx)**: Gỡ bỏ phần Import và Component `AddToCartButton`.
- **[DELETE] [CartDrawer.tsx](file:///c:/Users/ACER/Next-JS-Project/web_ban_do_dien_tu/src/components/cart/CartDrawer.tsx)**: Gỡ bỏ khỏi `layout.tsx` (tạm thời giữ file hoặc xóa nếu bác muốn sạch sẽ).

### 3. 📂 Page Cart Layout (Option A)
- **Left Column**: Danh sách `CartItem` (tái sử dụng component cũ nhưng trình bày theo hàng ngang rộng hơn).
- **Right Column**: Thẻ "Tóm tắt đơn hàng" (Order Summary) đè lên nền Glassmorphism, hiển thị Tạm tính, Giảm giá (nếu có), và Nút "Tiến hành thanh toán".

## Quy trình thực hiện (Tasks)
1. `[x]` Cài đặt `framer-motion` (Đã hoàn thành).
2. `[x]` Xây dựng khung trang `/cart` với dữ liệu thực tế từ `useCartStore`.
3. `[x]` Chỉnh sửa `Header` để icon giỏ hàng có `ID="cart-icon-target"`.
4. `[x]` Implement logic "Flying Animation" trong `AddToCartButton`.
5. `[x]` Dọn dẹp `ProductCard` và `layout.tsx`.

## Câu hỏi mở (Open Questions)
> [!CAUTION]
> - Bác có muốn icon Giỏ hàng ở Header có hiệu ứng "rung" (Bounce) nhẹ khi nhận được sản phẩm bay vào không?
