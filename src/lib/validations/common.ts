import { z } from "zod";

/**
 * Common Zod schemas for reuse across the application.
 * Focuses on DRY (Don't Repeat Yourself) and automatic sanitization.
 */

// Basic sanitizers
export const trimString = z.string().trim();

// Generic required string with custom error
export const requiredString = (fieldName: string) => 
  z.string({ error: `${fieldName} không được để trống` })
   .trim()
   .min(1, { message: `${fieldName} không được để trống` });


// Price / Number fields with transformation from string (common in HTML inputs)
export const numericField = (fieldName: string, min = 0, isInt = false) => {
  const schema = z.coerce.number({ 
    error: `${fieldName} phải là một con số` 
  }).min(min, { message: `${fieldName} không thể nhỏ hơn ${min}` });

  return isInt ? schema.int({ message: `${fieldName} phải là số nguyên` }) : schema;
};





// Slug validation (lowercase, no spaces, only alphanumeric and hyphens)
export const slugSchema = trimString
  .min(1, "Slug không được để trống")
  .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang");

// Image URL validation (basic check)
export const imageUrlSchema = z.string().url("Đường dẫn hình ảnh không hợp lệ").or(z.string().min(1, "Vui lòng tải lên hoặc nhập URL hình ảnh"));

// UUID validation (for database IDs)
export const uuidSchema = z.string().uuid("ID không hợp lệ");
