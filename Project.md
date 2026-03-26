# Project Structure: Antigravity E-commerce Platform

This document describes the function of each file and its key components or functions within the project.

## 1. Core Application (src/app)

| Path | Description | Key Components / Functions |
| :--- | :--- | :--- |
| `app/layout.tsx` | Root layout for the entire application. | Wraps children with `Header` and global styles. |
| `app/page.tsx` | Home page (Landing & Products). | Renders product listing with Carousel and Filter Bar. |
| `app/admin/layout.tsx` | Layout for the Admin Dashboard. | Provides sidebar navigation for admin routes. |
| `app/admin/page.tsx` | Admin Dashboard Overview. | Shows high-level statistics and product management. |
| `app/admin/products/page.tsx` | Product Management List. | Table view with Edit/Delete actions. |
| `app/admin/products/new/page.tsx` | Add New Product Page. | Wrapper for the `ProductForm` component. |
| `app/admin/products/[id]/edit/page.tsx` | Edit Product Page. | Dynamic route for updating existing products. |

## 2. UI Components (src/components)

### General Components
| Path | Description | Key Functions |
| :--- | :--- | :--- |
| `components/Header.tsx` | Main navigation bar. | Includes category search and user links. Hides on Admin routes. |
| `components/ProductCard.tsx` | Professional product card. | Displays price, badges, spec tags (CellphoneS style). |
| `components/ProductList.tsx` | Product grid container. | Renders a grid of `ProductCard` components. |
| `components/Carousel.tsx` | Banner slider. | Displays promotional images on the homepage. |
| `components/common/ProductImage.tsx` | Unified image handler. | Centralizes Cloudinary vs External URL logic. |

### Admin Components (src/components/admin)
| Path | Description | Key Functions |
| :--- | :--- | :--- |
| `components/admin/ProductForm.tsx` | Product Form UI. | Orchestrates layout. Uses `useProductForm` hook for logic. |
| `components/admin/AdminInput.tsx` | Reusable input field. | Standardized styling for admin forms. |
| `components/admin/AdminSelect.tsx` | Reusable dropdown. | Handles Category and Brand selection. |
| `components/admin/AdminToggle.tsx` | Toggle switch. | Used for "0% Installment" selection. |
| `components/admin/SpecManager.tsx` | Specification editor. | Key-Value UI for technical specs (JSONB). |
| `components/admin/ImageUpload.tsx` | Cloudinary Integration. | Handles image uploads and preview display. |

## 3. Data & Logic (src/services, src/utils, src/types, src/hooks)

| Path | Description | Key Functions |
| :--- | :--- | :--- |
| `services/productService.ts` | Data Access Layer. | CRUD operations for products, categories, and brands. |
| `hooks/useProductForm.ts` | Form Logic Hook. | Manages state, validation, and submission for products. |
| `types/database.ts` | Database Schema Types. | `Product`, `Brand`, `Category`, `ProductWithDetails`. |
| `utils/supabase/client.ts` | Browser Client. | `createClient()` for client-side Supabase access. |
| `utils/supabase/server.ts` | Server Client. | `createClient()` for SSR and Server Components. |

## 4. Configuration & Styles
| Path | Description |
| :--- | :--- |
| `app/globals.css` | Global Tailwind CSS styles and theme colors (Magenta/Indigo). |
| `.env.local` | Sensitive environment variables (Supabase URL, Cloudinary Keys). |
| `Database.md` | Reference document for the database schema. |
