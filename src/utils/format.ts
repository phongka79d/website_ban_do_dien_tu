/**
 * Định dạng tiền tệ VND
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Định dạng ngày tháng
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Định dạng số rút gọn (VD: 4.5tr, 1.2 tỷ) cho tiền tệ VN
 */
export const formatCompactNumber = (amount: number): string => {
  if (amount >= 1e9) {
    return (amount / 1e9).toFixed(1).replace(/\.0$/, "") + " tỷ";
  }
  if (amount >= 1e6) {
    return (amount / 1e6).toFixed(1).replace(/\.0$/, "") + "tr";
  }
  if (amount >= 1e3) {
    return (amount / 1e3).toFixed(0).replace(/\.0$/, "") + "k";
  }
  return amount.toString();
};
