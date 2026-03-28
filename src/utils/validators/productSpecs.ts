import { z } from "zod";

/**
 * Zod Schema cho phép Admin tùy chỉnh key-value thoải mái.
 * Đảm bảo specs là 1 object mapping từ chuỗi sang bất kỳ kiểu nào (thường là string/number).
 */
export const productSpecsSchema = z.record(z.string(), z.any());

/**
 * Helper gợi ý các keys thường dùng cho từng Category.
 * Dùng trên giao diện Admin để User click nhanh mà không cần gõ, nhưng vẫn cho phép gõ thêm thỏa thích.
 */
export const getSuggestedSpecs = (categorySlug: string): string[] => {
  switch (categorySlug) {
    case "headphones":
      return ["Kết nối", "Thời lượng pin", "Chống ồn (ANC)", "Tần số phản hồi", "Trọng lượng"];
    case "mouse":
      return ["Mắt đọc", "DPI tối đa", "Trọng lượng", "Switch", "Số nút", "Thời lượng pin"];
    case "keyboard":
      return ["Loại Switch", "Layout", "Đèn LED", "Kết nối", "Chất liệu keycap"];
    case "laptop":
      return ["CPU", "RAM", "Ổ cứng", "VGA", "Màn hình", "Dung lượng pin", "Trọng lượng"];
    case "smartphone":
      return ["Màn hình", "Chipset", "RAM", "Bộ nhớ trong", "Camera sau", "Camera trước", "Pin", "Sạc nhanh"];
    case "ram":
      return ["Dung lượng", "Loại RAM", "Tốc độ (Bus)", "Độ trễ (CAS latency)"];
    default:
      return ["Chất liệu", "Kích thước", "Trọng lượng", "Bảo hành", "Màu sắc"];
  }
};
