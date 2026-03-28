# 📋 Báo cáo Tổng hợp & Đề xuất Tái cấu trúc (Architecture Audit)

Ngày báo cáo: 28/03/2026
Người thực hiện: Antigravity AI (Orchestrator Mode)
Cập nhật lần cuối: 28/03/2026 — Sprint P0 + P1 + P2 **HOÀN THÀNH**

---

## 🏗️ 1. Hiện trạng Kiến trúc

### 📱 1.1 Luồng Xác thực (Auth Flow)
- ✅ **`AuthCard.tsx`** — Glassmorphism wrapper, tích hợp: `login`, `register`, `forgot-password`.
- ✅ **`AuthInput.tsx`** — Input field chuẩn (icon, labelSlot, rightSlot, error), tích hợp: `login`, `register`, `forgot-password`.

### 🔢 1.2 Thành phần OTP
- ✅ **`OtpField.tsx`** — OTP 6 số + countdown + resend, tích hợp: `register`, `forgot-password`, `profile/security`.

### 🛠️ 1.3 Hệ thống Admin
- ✅ **`AdminManagerShell.tsx`** — Search + Thêm mới + Loading + Empty state, tích hợp: Banner, Brand, Category.
- ✅ **`AdminActionModal.tsx`** — Modal scaffold Create/Edit, tích hợp: Banner, Brand, Category.
- ✅ **`StatusBadge.tsx`** (`ui/`) — Badge Active/Inactive, tích hợp: BannerManager.

---

## 🎯 2. Danh sách "Ứng viên" Component hóa

### 💎 Atoms (Thành phần nguyên tử)
- ⬜ **`ui/Card.tsx`** — Gác lại, `AuthCard` đủ dùng cho Auth scope.
- ⬜ **`ui/Button.tsx`** — Gác lại đến P3, quá nhiều biến thể.

### 🧬 Molecules
- ✅ `auth/AuthCard.tsx`
- ✅ `auth/AuthInput.tsx`
- ✅ `auth/OtpField.tsx`
- ✅ `admin/AdminManagerShell.tsx`
- ✅ `admin/AdminActionModal.tsx`
- ✅ `ui/StatusBadge.tsx`

### 🧪 Logic & Hooks
- ✅ **`useOtpTimer`** — Tích hợp bên trong `OtpField`, không tách riêng.
- ❌ **`useAuthActions`** — Loại bỏ, không đủ ROI.

---

## 🚀 3. Lộ trình Refactoring

| Status | Ưu tiên | Thành phần | Lợi ích |
|:---:|:---:|:---|:---|
| ✅ | **P0** | `AuthCard.tsx` | ~45 dòng CSS wrapper |
| ✅ | **P0** | `OtpField.tsx` | ~120 dòng logic OTP |
| ✅ | **P0** | `AdminManagerShell.tsx` | ~150 dòng header/loading |
| ✅ | **P1** | `AdminActionModal.tsx` | ~45 dòng modal scaffold |
| ✅ | **P2** | `AuthInput.tsx` | ~90 dòng input blocks |
| ✅ | **P2** | `StatusBadge.tsx` | ~8 dòng badge |

> **Tổng kết**: Đã xóa **~458 dòng** code trùng lặp, tạo **6 components** tái sử dụng được.

---

## 💡 4. Sprint P3 (Tương lai — chưa có kế hoạch)

- `ui/Button.tsx` — Chuẩn hóa nút bấm với loading states (khi có đủ thiết kế hệ thống).
- `ui/Card.tsx` — Generic Glassmorphism card (nếu mở rộng ra ngoài Auth scope).
