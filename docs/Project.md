# Project Structure: Antigravity E-commerce Platform

Tài liệu này mô tả chi tiết kiến trúc, cấu trúc thư mục và chức năng của các thành phần trong dự án website bán đồ điện tử. Dự án được xây dựng với mục tiêu mang lại trải nghiệm mua sắm cao cấp và quản trị mạnh mẽ.

## ⚙️ 1. Tổng quan Công nghệ (Tech Stack)

| Lớp (Layer) | Công nghệ |
| :--- | :--- |
| **Framework** | Next.js 16.2.1 (App Router), React 19.2.4 |
| **Styling** | Tailwind CSS 4, Framer Motion (Animations) |
| **Database/Auth** | Supabase (PostgreSQL, GoTrue for Auth) |
| **State Management** | Zustand (Persistent Cart) |
| **Editor** | Tiptap (Rich Text for Product Descriptions) |
| **Media** | Cloudinary (Image Hosting & Optimization) |
| **Infrastructure** | Service Worker (Bypass Router Cache) |

---

## 📁 2. Cấu trúc Thư mục Chính (src/app)

### ✨ Cấu hình Toàn cục & Layout
- `app/layout.tsx`: Root Layout chính, đăng ký `ServiceWorkerManager` và `Header`.
- `app/globals.css`: Chứa các biến theme Tailwind 4 (Magenta/Indigo).
- `app/not-found.tsx`: Trang lỗi 404 tùy chỉnh.
- `middleware.ts`: Hệ thống bảo mật, kiểm soát truy cập Admin và User.

### 🛒 Phân đoạn Cửa hàng (`app/(shop)`)
- `app/(shop)/page.tsx`: Trang chủ với Carousel cao cấp và danh sách sản phẩm.
- `app/(shop)/cart/`: Trang giỏ hàng, tính toán giá trị đơn hàng thực tế.
- `app/(shop)/products/`: Chi tiết sản phẩm và danh sách theo bộ lọc.
- `app/(shop)/category/`: Trang danh mục sản phẩm.
- `app/(shop)/profile/`: Quản lý thông tin cá nhân khách hàng.
- `app/(shop)/wishlist/`: Trang danh sách sản phẩm yêu thích của người dùng.

### 🔐 Phân đoạn Authenticate
- `app/login/`, `app/register/`: Trang đăng nhập và đăng ký.
- `app/forgot-password/`: Quy trình khôi phục mật khẩu.
- `app/auth/actions.ts`: Chứa các Server Actions cho đăng nhập/đăng ký.
- `app/auth/profile-actions.ts`: Các tác vụ liên quan đến cập nhật hồ sơ.

### 🛠️ Phân đoạn Quản trị (`app/admin`)
- `admin/page.tsx`: Dashboard tổng quan, thống kê nhanh.
- `admin/products/`: Quản lý sản phẩm (CRUD), hỗ trợ thông số kỹ thuật (JSONB).
- `admin/banners/`: Chỉnh sửa danh sách banner cho Homepage Carousel.
- `admin/categories/`: Quản lý các nhóm sản phẩm theo slug.
- `admin/brands/`: Quản lý thương hiệu và logo nhà sản xuất.

---

## 🛡️ 3. Cơ chế Ổn định & Kiến trúc

### Network Interceptor (Next.js 16 Fix)
- `public/sw.js`: **Service Worker** quan trọng để intercept các request điều hướng, giúp tránh tình trạng "đóng băng" UI do cơ chế Router Cache của Next.js 16.
- `components/ServiceWorkerManager.tsx`: Thành phần client-side đăng ký SW an toàn.

### Bảo mật & Validate
- `utils/validators/`: Chứa các schema validation (ví dụ: `productSpecs.ts`).
- `utils/auth-helpers.ts`: Các hàm hỗ trợ kiểm tra quyền và trạng thái session.
- `utils/auth-messages.ts`: Quản lý các thông báo lỗi/thành công (đã Việt hóa).

---

## 🎨 4. Thành phần Giao diện (src/components)

### UI chung (General)
- `components/Header.tsx`: Thanh điều hướng sticky, tích hợp tìm kiếm và admin link.
- `components/Carousel.tsx`: Slider banner 50/50 layout, hỗ trợ glassmorphism.
- `components/ProductCard.tsx`: Card sản phẩm tương thích mobile, hiển thị badge cấu hình.

### Hệ thống Admin Components
- `components/admin/AdminManagerShell.tsx`: Khung (Shell) chuẩn cho các trang quản trị CMS.
- `components/admin/ProductForm.tsx`: Form quản lý sản phẩm tích hợp Cloudinary và JSONB specs.
- `components/admin/SpecManager.tsx`: Trình chỉnh sửa thông số kỹ thuật động (Key-Value).
- `components/admin/RichTextEditor.tsx`: Soạn thảo mô tả sản phẩm bằng Tiptap cao cấp.
- `components/admin/ImageUpload.tsx`: Widget tải lên và xem trước ảnh qua Cloudinary.
- `components/admin/AdminActionModal.tsx`: Modal phản hồi và hành động chung.

---

## 💾 5. Dữ liệu & Logic (src/services, store, hooks)

### Data Access Layer (DAL)
- `services/productService.ts`: Các thao tác Supabase liên quan đến sản phẩm.
- `services/categoryService.ts`, `services/brandService.ts`: Quản lý danh mục và thương hiệu.
- `services/bannerService.ts`: Quản lý dữ liệu từ bảng `banners`.

### State Management
- `store/useCartStore.ts`: Sử dụng **Zustand** với middleware `persist` để quản lý giỏ hàng đồng bộ trên LocalStorage.
- `store/useWishlistStore.ts`: Quản lý danh sách sản phẩm yêu thích, đồng bộ trực tiếp với Supabase.

### Custom Hooks
- `hooks/useProductForm.ts`: Quản lý trạng thái form sản phẩm và logic tích hợp ảnh.

---

## 📍 6. Trạng thái Phát triển (Feature Roadmap)

Dưới đây là tiến độ thực hiện các tính năng dựa trên [Kế hoạch Chức năng](file:///c:/Users/ACER/Next-JS-Project/web_ban_do_dien_tu/docs/functional-plan.md):

### ✅ Đã hoàn thành (Done)
- [x] **Xác thực (Auth):** Email OTP, Phone Auth, Password.
- [x] **Phân quyền (RBAC):** Role Admin/User, khóa tài khoản Real-time.
- [x] **Trang chủ:** Carousel cao cấp, lưới sản phẩm từ DB.
- [x] **Admin CMS:** CRUD Sản phẩm (JSONB), Banner, Thương hiệu, Danh mục.
- [x] **Architecture:** Service Worker bypass cache, middleware bảo mật.
- [x] **Yêu thích (Wishlist):** Lưu sản phẩm, hiệu ứng animation trái tim bay, trang danh sách riêng.
- [x] **Giỏ hàng (Cart):** Đã có store Zustand, đang hoàn thiện UI và đồng bộ hóa.
- [x] **Chi tiết Sản phẩm:** Hiển thị thông số kỹ thuật chi tiết và mô tả Rich Text.


### 🚧 Đang thực hiện (In Progress)
- [ ] **Bộ lọc & Tìm kiếm:** Lọc theo giá, thương hiệu, specs.
- [ ] **Quản lý Đơn hàng (Admin):** Xem và cập nhật trạng thái vận chuyển.


### 📅 Lộ trình sắp tới (Todo)
- [ ] **Thanh toán (Checkout):** Nhập thông tin giao hàng & COD.
- [ ] **Hệ thống Premium:** So sánh sản phẩm, Gợi ý AI, Dark Mode.

---

*Tài liệu này được cập nhật tự động dựa trên cấu trúc thực tế của dự án.*
