/**
 * Dictionary of Database Error Messages in Vietnamese
 * Focuses on PostgREST/Supabase Check Constraints and Database errors
 */
const DB_ERRORS: Record<string, string> = {
  // Check Constraints (Defined in PostgreSQL.md)
  'products_check': "Giá gốc phải lớn hơn hoặc bằng giá bán. Vui lòng kiểm tra lại.",
  'products_price_check': "Giá bán không được là số âm.",
  'products_stock_quantity_check': "Số lượng tồn kho không được là số âm.",
  'cart_items_quantity_check': "Số lượng sản phẩm trong giỏ hàng phải lớn hơn 0.",
  'orders_total_amount_check': "Tổng số tiền đơn hàng không được nhỏ hơn 0.",
  'order_items_quantity_check': "Số lượng sản phẩm trong đơn hàng phải lớn hơn 0.",
  'profiles_role_check': "Vai trò người dùng không hợp lệ.",

  // General Supabase / Postgres Errors
  'violates check constraint': "Dữ liệu nhập vào chưa đúng quy định của hệ thống. Vui lòng kiểm tra lại các trường số liệu.",
  'violates unique constraint': "Thông tin này đã tồn tại trong hệ thống (trùng lặp).",
  'violates foreign key constraint': "Không thể thực hiện thao tác vì dữ liệu đang được liên kết với thành phần khác.",
  'null value in column': "Vui lòng điền đầy đủ các thông tin bắt buộc.",
  'string or binary data would be truncated': "Dữ liệu nhập vào quá dài so với giới hạn cho phép.",
};

/**
 * Translates a Supabase/PostgREST error message or code to Vietnamese.
 * @param error The error message string or object from Supabase
 * @returns A friendly Vietnamese error message
 */
export function getDbErrorMessage(error: any): string {
  if (!error) return "Đã có lỗi không xác định xảy ra.";

  const message = typeof error === 'string' ? error : (error.message || "");
  
  // 1. First, check for specific constraint names in the message
  for (const [constraint, translated] of Object.entries(DB_ERRORS)) {
    if (message.includes(`"${constraint}"`)) {
      return translated;
    }
  }

  // 2. Second, check for general error patterns
  for (const [pattern, translated] of Object.entries(DB_ERRORS)) {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      return translated;
    }
  }

  // 3. Fallback to original message or generic error
  return "Đã có lỗi xảy ra trong quá trình xử lý dữ liệu. Vui lòng thử lại.";
}
