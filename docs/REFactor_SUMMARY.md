# 📋 Báo cáo Tổng hợp & Đề xuất Tái cấu trúc (Architecture Audit)

Ngày báo cáo: 28/03/2026
Người thực hiện: Antigravity AI (Orchestrator Mode)

---

## 🏗️ 1. Hiện trạng Kiến trúc (Current Architecture)

Dự án đang sử dụng Next.js (App Router) với phong cách thiết kế hiện đại (Glassmorphism), nhưng đang gặp vấn đề về **sự trùng lặp mã nguồn (Code Duplication)** ở các thành phần sau:

### 📱 1.1 Luồng Xác thực (Auth Flow)
- **Tình trạng**: Các trang `login`, `register`, `forgot-password` và `profile/security` đang sao chép gần như 100% mã CSS cho phần UI Card (backdrop-blur, border tinh thể). 
- **Mã lặp**: ~120 dòng code UI Card ở mỗi file.

### 🔢 1.2 Thành phần OTP (6-Digit Input)
- **Tình trạng**: Logic nhập OTP, bộ đếm ngược 60 giây và nút "Gửi lại mã" đang được code cứng trong từng trang. Khi bạn sửa logic ở một nơi (như tôi vừa sửa lỗi Rules of Hooks) thì các trang khác vẫn còn lỗi cũ.
- **Vị trí**: `register`, `forgot-password`, `profile/security`.

### 🛠️ 1.3 Hệ thống Admin (CRUD Managers)
- **Tình trạng**: `BannerManager`, `BrandManager` và `CategoryManager` có cấu trúc rập khuôn. Mỗi file dài ~350-400 dòng, trong đó phần lớn là mã JSX cho các Modal (Thêm/Sửa/Xóa).
- **Vấn đề**: Khó bảo trì giao diện Admin đồng nhất.

---

## 🎯 2. Danh sách "Ứng viên" Component hóa

### 💎 Atoms (Thành phần nguyên tử)
- **`ui/Card.tsx`**: Wrapper dùng chung cho hiệu ứng Glassmorphism.
- **`ui/Input.tsx`**: Input field tiêu chuẩn (Icon + Floating Label + Error).
- **`ui/Button.tsx`**: Nút bấm với các trạng thái Loading tích hợp sẵn.
- **`ui/StatusBadge.tsx`**: Hiển thị trạng thái Active/Inactive, Success/Error.

### 🧬 Molecules (Thành phần phân tử)
- **`auth/OtpField.tsx`**: Gom nhóm logic OTP 6 số + Timer + Resend Action.
- **`admin/ManagerHeader.tsx`**: Search bar + Nút thêm mới tiêu chuẩn của Admin.
- **`admin/ActionModal.tsx`**: Modal khung dùng cho các form Create/Edit.

### 🧪 Logic & Hooks
- **`useOtpTimer`**: Hook quản lý đếm ngược và trạng thái resend.
- **`useAuthActions`**: Gom nhóm logic gọi API Login/Register sạch sẽ hơn.

---

## 🚀 3. Lộ trình Đề xuất (Refactoring Roadmap)

| Ưu tiên | Thành phần | Lợi ích | Độ khó |
|:---:|:---|:---|:---:|
| **P0** | **`OtpField.tsx`** | Xóa sạch logic dư thừa ở 3 trang cực kỳ quan trọng. | Trung bình |
| **P0** | **`AuthCard.tsx`** | Thống nhất giao diện Glassmorphism trên toàn site. | Dễ |
| **P1** | **`AdminBaseTable`** | Rút ngắn 60% code cho các trang quản trị Admin. | Cao |
| **P2** | **`FormValidator`** | Tự động hóa việc hiển thị thông báo lỗi Tiếng Việt. | Trung bình |

---

## 💡 4. Đề xuất Hướng đi

Tôi đề nghị chúng ta bắt đầu bằng việc **Tách Component `OtpField.tsx`**. 
- **Lý do**: Đây là phần phức tạp nhất, dễ lỗi nhất (như lỗi Rules of Hooks vừa rồi) và xuất hiện ở nhiều nơi nhạy cảm nhất.

Bạn có thể lưu bản Summary này làm kim chỉ nam để chúng ta "dọn dẹp" dự án dần dần.
