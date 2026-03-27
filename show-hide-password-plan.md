# Kế hoạch triển khai: Tính năng Ẩn/Hiện mật khẩu

## Goal
Thêm nút chuyển đổi trạng thái ẩn/hiện mật khẩu ở các màn hình Đăng nhập và Đăng ký để cải thiện trải nghiệm người dùng, giúp họ dễ dàng kiểm tra lại mật khẩu đã nhập.

## User Review Required
> [!NOTE]
> Bạn có yêu cầu sử dụng biểu tượng **kính lúp**. Tuy nhiên, trong thiết kế UI/UX hiện đại, biểu tượng **Con mắt (Eye)** là tiêu chuẩn cho tính năng này. Tôi sẽ sử dụng Con mắt để người dùng dễ nhận biết, nhưng nếu bạn vẫn muốn dùng Kính lúp (Search), tôi sẽ điều chỉnh lại sau.

## Proposed Changes

### [Frontend Components]

#### [MODIFY] [login/page.tsx](file:///c:/Users/ACER/Next-JS-Project/web_ban_do_dien_tu/src/app/login/page.tsx)
- Thêm state `showPassword`.
- Import `Eye`, `EyeOff` từ `lucide-react`.
- Cập nhật ô nhập mật khẩu:
    - `type={showPassword ? "text" : "password"}`
    - Thêm nút bấm icon ở góc phải ô input.

#### [MODIFY] [register/page.tsx](file:///c:/Users/ACER/Next-JS-Project/web_ban_do_dien_tu/src/app/register/page.tsx)
- Thực hiện tương tự như trang Login.

---

## Verification Plan

### Manual Verification
1. **Kiểm tra tại trang Đăng nhập:**
    - Nhập mật khẩu (hiển thị dấu chấm).
    - Nhấn vào biểu tượng con mắt -> Mật khẩu hiện rõ văn bản.
    - Nhấn lại lần nữa -> Mật khẩu ẩn đi.
2. **Kiểm tra tại trang Đăng ký:**
    - Thực hiện tương tự quy trình trên.
