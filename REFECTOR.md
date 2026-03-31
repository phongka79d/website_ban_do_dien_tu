# 🛠 DANH SÁCH REFACTOR & QUY TẮC ĐỒNG NHẤT

> **CHÚ Ý CHO AGENTS:** Đọc kỹ file này trước khi thực hiện bất kỳ thay đổi nào về UI hoặc Logic. Tuyệt đối không hardcode nếu đã có component/service tương ứng.

## 1. Quy tắc UI (UI Standards)
- **Buttons**: Luôn sử dụng `@/components/ui/Button`. Không viết thẻ `<button>` thủ công trừ trường hợp cực kỳ đặc biệt.
- **Images**: Luôn sử dụng `@/components/common/ProductImage` cho mọi hình ảnh sản phẩm/danh mục để hỗ trợ Cloudinary và Fallback tự động.
- **Badges**: Sử dụng `@/components/common/OrderStatusBadge` cho trạng thái đơn hàng.

## 2. Các file cần xử lý ngay (High Priority)
- [ ] **Header.tsx**: Thay thế toàn bộ thẻ `<button>` bằng component `Button`.
- [ ] **productService.ts**: Tạo hàm `genericSearch` để dùng chung cho Products, Categories, Brands.
- [ ] **Admin Pages**: Rà soát lại việc sử dụng các UI Atoms để đồng bộ với phần Shop.

## 3. Quy tắc Service
- Không fetch trực tiếp từ Supabase trong Component. Luôn đi qua tầng `services/`.
- Sử dụng `utils/cn` để kết hợp các class Tailwind một cách sạch sẽ.

---
*Cập nhật lần cuối: 2026-03-31 bởi Antigravity*
