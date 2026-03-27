## 🧠 Brainstorm: Đánh giá Tiến độ & Lộ trình Tiếp theo

### Context
Đánh giá các tính năng đã thực hiện so với `functional-plan.md` và đề xuất phương án triển khai các mục tiêu còn lại để đạt chuẩn MVP (Sản phẩm khả thi tối thiểu).

---

### Trạng thái Hiện tại (Progress Audit)

| Chức năng | Trạng thái | Chi tiết |
| :--- | :--- | :--- |
| **Xác thực & Bảo mật** | ✅ Hoàn thành | Email OTP, Phone Auth, is_active (Real-time lock), RLS Fix. |
| **Giao diện Core** | ✅ Hoàn thành | Header, Footer, Carousel, Glassmorphism UI, Responsive. |
| **Trang chủ (Shop)** | 🏗️ Đang làm | Hiển thị sản phẩm/banner từ DB, nhưng chưa có trang danh mục riêng. |
| **Chi tiết Sản phẩm** | ❌ Chưa có | Cần tạo trang `src/app/(shop)/product/[slug]`. |
| **Giỏ hàng & Thanh toán** | ❌ Chưa có | Cần hệ thống lưu trữ giỏ hàng và form checkout. |
| **Quản trị (Admin)** | 🏗️ Khởi tạo | Có thư mục `admin` nhưng các trang CRUD chưa hoàn thiện. |

---

### Option A: Tập trung hoàn thiện Luồng Mua hàng (UX Flow)
Ưu tiên xây dựng trang Chi tiết sản phẩm và Giỏ hàng để người dùng có thể thực hiện giao dịch.

✅ **Pros:**
- Hoàn thiện luồng người dùng cốt lõi nhanh chóng.
- Có thể demo được tính năng mua sắm ngay.

❌ **Cons:**
- Tạm gác lại phần Admin (phải nhập dữ liệu thủ công qua Supabase Dashboard).

📊 **Effort:** Medium

---

### Option B: Hoàn thiện hệ thống Quản trị (Admin CMS)
Xây dựng các trang CRUD dành cho Admin để quản lý Sản phẩm và Banner một cách trực quan.

✅ **Pros:**
- Admin không cần động vào SQL/Dashboard của Supabase.
- Kiểm soát tốt dữ liệu sản phẩm phức tạp (JSONB Specs).

❌ **Cons:**
- Người dùng cuối vẫn chưa thể mua hàng (vì thiếu Giỏ hàng/Chi tiết).

📊 **Effort:** Medium

---

### Option C: Phương án "Full-Sprint" (Khuyên dùng)
Triển khai song song trang **Chi tiết Sản phẩm** và **Giỏ hàng đơn giản** (Local Storage), sau đó mới làm Admin.

✅ **Pros:**
- Đưa website về trạng thái "Có thể bán hàng" nhanh nhất.
- Tận dụng `ProductService` đã có sẵn.

❌ **Cons:**
- Khối lượng công việc lớn hơn trong một giai đoạn.

📊 **Effort:** High

---

## 💡 Recommendation

Tôi đề xuất chọn **Option C**. 

**Lý do:** Chúng ta đã có `productService.ts` khá mạnh với các hàm lấy dữ liệu theo slug. Việc tạo trang Chi tiết và Giỏ hàng sẽ giúp dự án "thực sự sống". Sau đó, chúng ta sẽ làm Admin để quản lý danh sách này dễ dàng hơn.

**Bước tiếp theo đề xuất:**
1. Tạo trang `src/app/(shop)/product/[slug]/page.tsx`.
2. Hiện thực `CartContext` để quản lý giỏ hàng toàn cục.
3. Xây dựng trang `src/app/(shop)/cart/page.tsx`.

Bạn muốn tôi bắt đầu với mục nào trước?
