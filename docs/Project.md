# Project Structure: Antigravity E-commerce Platform

Tài liệu này mô tả chi tiết kiến trúc, cấu trúc thư mục và chức năng của các thành phần trong dự án website bán đồ điện tử. Dự án được xây dựng với mục tiêu mang lại trải nghiệm mua sắm cao cấp và quản trị mạnh mẽ.

## ⚙️ 1. Tổng quan Công nghệ (Tech Stack)

| Lớp (Layer) | Công nghệ |
| :--- | :--- |
| **Framework** | Next.js 16.2.1 (App Router), React 19.2.4 |
| **Styling** | Tailwind CSS 4 (Magenta/Indigo), Framer Motion (Animations) |
| **Database/Auth** | Supabase (PostgreSQL, GoTrue for Auth) |
| **State Management** | Zustand (Persistent Cart & Wishlist) |
| **Editor** | Tiptap (Rich Text for Product Descriptions) |
| **Media** | Cloudinary (Image Hosting & Optimization) |
| **Infrastructure** | Service Worker (Bypass Router Cache for Next.js 16) |

---

## 📁 2. Cấu trúc Thư mục Chính (src/app)

### ✨ Cấu hình Toàn cục & Layout
- `app/layout.tsx`: Root Layout chính, đăng ký `ServiceWorkerManager` và `Header`.
- `app/globals.css`: Chứa các biến theme Tailwind 4 và Utility classes.
- `middleware.ts`: Hệ thống bảo mật nâng cao, kiểm soát quyền Admin/User và bảo vệ các private routes.

### 🛒 Phân đoạn Cửa hàng (`app/(shop)`)
- `app/(shop)/page.tsx`: Trang chủ với Carousel cao cấp và danh sách sản phẩm.
- `app/(shop)/cart/`: Trang giỏ hàng với tính toán giá trị thực tế và hiệu ứng animation.
- `app/(shop)/checkout/`: Quy trình thanh toán (Shipping info, Payment methods).
- `app/(shop)/track-order/`: Tính năng tra cứu trạng thái đơn hàng theo ID.
- `app/(shop)/products/`: Trang danh sách sản phẩm và chi tiết sản phẩm.
- `app/(shop)/category/`: Lọc sản phẩm theo danh mục và thuộc tính.
- `app/(shop)/profile/`: Quản lý hồ sơ, địa chỉ và lịch sử đơn hàng của người dùng.
- `app/(shop)/wishlist/`: Danh sách sản phẩm yêu thích đồng bộ thời gian thực.

### 🔐 Phân đoạn Authenticate
- `app/login/`, `app/register/`: Trang đăng nhập/đăng ký với đa phương thức (OTP, Password).
- `app/auth/actions.ts`: Server Actions xử lý luồng Authentication bảo mật.

### 🛠️ Phân đoạn Quản trị (`app/admin`)
- `admin/page.tsx`: Dashboard quản trị với biểu đồ thống kê cơ bản.
- `admin/orders/`: Hệ thống quản lý đơn hàng chuyên sâu (Cập nhật trạng thái, In hóa đơn).
- `admin/products/`: Quản lý danh mục sản phẩm (CRUD) với hỗ trợ JSONB Thông số kỹ thuật.
- `admin/banners/`: Trình quản lý Carousel trang chủ (hỗ trợ Live Preview).
- `admin/categories/` & `admin/brands/`: Quản lý metadata cho hệ thống.

---

## 🛡️ 3. Cơ chế Ổn định & Kiến trúc

### Network Stability (Next.js 16 Fix)
- `public/sw.js`: **Service Worker** quan trọng để tránh tình trạng Router Cache gây đóng băng UI trên Next 16.
- `components/ServiceWorkerManager.tsx`: Thành phần đăng ký SW tại client.

### Bảo mật & Trải nghiệm
- `utils/auth-messages.ts`: Hệ thống thông báo tập trung, đã bản địa hóa hoàn toàn.
- `utils/validators/`: Schema validation bằng Zod cho toàn bộ các form nhập liệu.

---

## 🎨 4. Thành phần Giao diện (src/components)

### UI chung (General)
- `components/Header.tsx`: Thanh điều hướng thông minh, tích hợp quản lý trạng thái giỏ hàng.
- `components/Carousel.tsx`: Slider banner 50/50 layout tối ưu cho hình ảnh sản phẩm.
- `components/ProductCard.tsx`: Card sản phẩm tương thích mobile, hiển thị badge thuộc tính.

### Hệ thống Admin Components
- `components/admin/AdminSidebar.tsx`: Sidebar điều hướng phân quyền tích hợp.
- `components/admin/BannerManager.tsx`: **Premium** CMS Banner với tính năng *Live Preview Mockup*.
- `components/admin/AdminInput.tsx`: Input cao cấp hỗ trợ hiển thị icon và validation state.
- `components/admin/ProductForm.tsx`: Hệ thống form phức tạp cho quản lý sản phẩm.
- `components/admin/ImageUpload.tsx`: Widget tải lên Cloudinary tích hợp xem trước.

---

## 💾 5. Dữ liệu & Logic (src/services, store)

### Data Access Layer (DAL)
- `services/orderService.ts`: Xử lý logic nghiệp vụ liên quan đến đơn hàng và vận chuyển.
- `services/productService.ts`: Tương tác cơ sở dữ liệu cho toàn bộ sản phẩm.
- `services/cartService.ts`: Đồng bộ hóa giỏ hàng giữa local storage và server.

### State Management (Zustand)
- `store/useCartStore.ts`: Quản lý giỏ hàng `persist` liên tục.
- `store/useWishlistStore.ts`: Quản lý sản phẩm yêu thích đồng bộ Supabase.

---

## 📍 6. Trạng thái Phát triển (Feature Roadmap)

Dựa trên [Kế hoạch Chức năng](file:///c:/Users/ACER/Next-JS-Project/web_ban_do_dien_tu/docs/functional-plan.md):

### ✅ Đã hoàn thành (Done)
- [x] **Xác thực & Bảo mật:** OTP, Password, Role-based Access Control (RBAC).
- [x] **Giao diện trang chủ:** Banner Carousel Mockup, Grid sản phẩm.
- [x] **Danh mục & Tìm kiếm:** Lọc sản phẩm theo Category và Brand.
- [x] **Quản trị CMS:** CRUD Sản phẩm, Banner, Thương hiệu, Danh mục.
- [x] **Giỏ hàng & Yêu thích:** State management hoàn chỉnh, đồng bộ DB.
- [x] **Trang Checkout:** Nhập thông tin, chọn phương thức thanh toán (COD/Bank).
- [x] **Quản lý Đơn hàng (Admin):** Danh sách đơn hàng, cập nhật trạng thái vận chuyển.
- [x] **Chi tiết Sản phẩm:** Thông số kỹ thuật chuyên dụng và Rich Text description.
- [x] **Theo dõi đơn hàng:** Tra cứu công khai dựa trên mã định danh.

### 🚧 Đang thực hiện (In Progress)
- [ ] **Thống kê chuyên sâu:** Biểu đồ doanh thu và xu hướng mua sắm.
- [ ] **Email Automation:** Tự động gửi email xác nhận đơn hàng và mã vận đơn.

### 📅 Lộ trình sắp tới (Todo)
- [ ] **Hệ thống So sánh Sản phẩm:** Bảng so sánh thông số kỹ thuật động.
- [ ] **Gợi ý AI:** Tự động đề xuất sản phẩm dựa trên hành vi người dùng.
- [ ] **Dark Mode:** Đa dạng giao diện cho trải nghiệm ban đêm.

---

*Tài liệu này được cập nhật tự động dựa trên cấu trúc thực tế của dự án.*
