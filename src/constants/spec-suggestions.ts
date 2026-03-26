export const COMMON_SPECS = [
  "Màn hình", "CPU", "RAM", "Bộ nhớ trong", "Pin",
  "Camera sau", "Camera selfie", "SIM", "Hệ điều hành",
  "Độ phân giải", "Trọng lượng", "Kích thước"
];

export const SPEC_VALUE_SUGGESTIONS: Record<string, string[]> = {
  "RAM": ["4GB", "8GB", "12GB", "16GB", "24GB", "32GB", "64GB"],
  "Bộ nhớ trong": ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"],
  "Pin": ["3000 mAh", "4000 mAh", "4500 mAh", "5000 mAh", "6000 mAh", "7000 mAh"],
  "Hệ điều hành": ["iOS 17", "iOS 18", "Android 13", "Android 14", "Windows 11"],
  "SIM": ["2 SIM (Nano-SIM)", "1 Nano SIM & 1 eSIM", "Dual SIM"],
  "Màn hình": ["6.1 inch", "6.7 inch", "OLED, 120Hz", "AMOLED", "Retina"],
  "CPU": ["Apple A17 Pro", "Snapdragon 8 Gen 3", "Apple M3", "Intel Core i5", "Intel Core i7"],
};
