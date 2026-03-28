# Antigravity E-Commerce: Architecture Summary

> **"Simplicity is the ultimate sophistication."** - Khung kiến trúc tập trung vào Tốc độ (Performance), Hiệu suất Phát triển (DX) và Bảo mật (Security).

---

## 🏗️ 1. Tech Stack (Công nghệ Lõi)
- **Core Framework:** Next.js 16.2.1 (App Router)
- **UI & Styling:** Tailwind CSS v4, Lucide React (Icons), CSS-in-JS hạn chế, ưu tiên Pure CSS/Tailwind Class. Thiết kế thiên hướng **Glassmorphism 50/50 Layout**.
- **Backend as a Service (BaaS):** Supabase (PostgreSQL 15+).
- **Authentication:** Supabase Auth SSR (@supabase/ssr) kết hợp JWT Cookie.
- **Media Asset Management:** Cloudinary (thông qua `next-cloudinary`) để giảm tải cho băng thông Database.

---

## 📂 2. Cấu trúc Thư mục (Directory Structure)
Dự án được phân rã theo Domain-driven Design (DDD) cơ bản:

```text
src/
├── app/                  # Chứa toàn bộ Routing (Next Core)
│   ├── (shop)/           # Nhóm giao diện Khách hàng (Home, Category, Profile...)
│   ├── admin/            # Nhóm giao diện Quản trị viên (Protected)
│   ├── auth/             # Route xử lý xác thực (Login, Register, Callback, Actions)
│   └── api/              # API Routes (Chủ yếu để debug hoặc Webhook)
├── components/           # UI Components chia sẻ độc lập (Header, ProductList, Carousel...)
├── services/             # Business Logic Layer (Ngôn ngữ Tương tác với DB) - vd: productService.ts
├── utils/                # Utility Functions (Validate, Formatter, Supabase Client Builder)
docs/                     # Hệ thống Kiến thức dự án (Kiến trúc DB, SQL Triggers...)
```

---

## 🔒 3. Hệ thống Xác thực & Phân quyền (Auth & RBAC)
Dự án áp dụng mô hình **Dual-Table Sync** (Đồng bộ Bảng kép) bảo mật cao:
1. **Core Auth Table:** `auth.users` đóng vai trò rào chắn chống Bot, lưu mật khẩu Hash và JWT.
2. **Public Table:** `public.profiles` lưu thông tin định danh hiển thị của Web (Tên, Số điện thoại, Avatar).
3. **Trigger DB:** Tự động bắt sự kiện bên `auth.users` để Push/Update Data sang `public.profiles`.
4. **Middleware:** Mọi request đều bị `middleware.ts` quét thẻ JWT. Ngăn chặn triệt để ai đó vào thư mục `/admin` nếu cột `role` trong Metadata không phải là `admin`.

---

## ⚡ 4. Data Flow (Luồng Chảy Dữ liệu)
Việc tương tác cơ sở dữ liệu hoàn toàn không sử dụng REST API truyền thống, mà ứng dụng sức mạnh của Next.js 14+:
- **Đọc Dữ liệu (Read):** Dùng React Server Components (RSC) fetch trực tiếp từ Supabase ngay trên Server để chặn hiện tượng chớp hình lúc tải (Waterfalls) và hưởng trọn tính năng Caching của Vercel Engine.
- **Ghi Dữ liệu (Write):** Sử dụng `Server Actions` (`"use server"`). Form Submit chạy ngầm gọi thẳng hàm Server (ví dụ `updateProfileInfo`), bỏ qua bước cấu hình rườm rà của Axios hay Redux.

---

## 🖼️ 5. Quản lý Ảnh (Media Management)
Do Supabase Storage có điểm yếu về tự động Crop ảnh kích thước lớn, dự án đã chọn **Cloudinary** làm trạm xử lý.
- Có thư mục phân vùng rõ ràng: `products/*` và `users/avatars`.
- Tối ưu hóa tải trang qua Component `<CldImage>` đẩy chất lượng WebP từ sườn CDN.

---

## ⚖️ 6. Trade-offs (Đánh đổi Kiến trúc)
- **Bỏ Redux/Zustand:** Toàn bộ State phức tạp được đẩy về Global URL State (Search Params) hoặc Context cục bộ. *Lý do: Next.js hỗ trợ Caching API rất dính, làm Global State trở nên cồng kềnh, thừa thãi.*
- **Supabase thay thế Prisma/NestJS:** Rút ngắn tiến độ 40% chi phí Backend, đổi lại phải lệ thuộc mạnh vào Trigger / RLS Policy (PostgreSQL) để ràng buộc bảo mật.
