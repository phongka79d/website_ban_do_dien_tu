# Project Structure: Antigravity E-commerce Platform

This document describes the function of each file and its key components or functions within the project, including recent architectural stability improvements.

## 1. Core Application (src/app)

### Global Configuration & Layout
| Path | Description | Key Components / Functions |
| :--- | :--- | :--- |
| `app/layout.tsx` | Global Root Layout. | Registers `ServiceWorkerManager` and `Header`. |
| `app/not-found.tsx` | Global 404 Fallback. | Prevents site-wide crashes on dead local links. |
| `app/globals.css` | Global Styles (Tailwind 4). | Theme variables for Magenta/Indigo color palette. |

### Shop Segment (`app/(shop)`)
| Path | Description | Key Functions |
| :--- | :--- | :--- |
| `app/(shop)/layout.tsx` | Shop-specific wrapper. | Adds `Suspense` for async data loading. |
| `app/(shop)/page.tsx` | Homepage (Landing). | Renders Premium `Carousel` and Product grid. |

### Admin Segment (`app/admin`)
| Path | Description | Key Functions |
| :--- | :--- | :--- |
| `admin/page.tsx` | Dashboard Overview. | High-level statistics and navigation. |
| `admin/products/` | Product Management. | CRUD for tech products & images. |
| `admin/banners/` | Banner Editor. | Management for the homepage Carousel items. |
| `admin/categories/` | Category CRUD. | Grouping management (slug-based). |
| `admin/brands/` | Brand CRUD. | Manufacturer management with logo support. |

---

## 2. Stability & Architecture Layers

### Network Interceptor (Next.js 16 Fix)
| Path | Description | Key Functions |
| :--- | :--- | :--- |
| `public/sw.js` | **Service Worker**. | Intercepts navigations to bypass Router Cache freeze. |
| `components/ServiceWorkerManager.tsx` | SW Registration (Client). | Registers SW safely on the client side. |

### Documentation & Forensics
| Path | Description |
| :--- | :--- |
| `Bug.md` | **Forensic History**. | Detailed log of investigation and fixes for the Carousel freeze. |
| `ARCHITECTURE_SUMMARY.md` | **Full Architecture Report**. | High-level overview of tech stack and design patterns. |
| `Database.md` | **Database Schema**. | Details on PgSQL tables and JSONB specifications. |

---

## 3. UI Components (src/components)

### Premium General Components
| Path | Description | Key Features |
| :--- | :--- | :--- |
| `components/Carousel.tsx` | Premium Banner Slider. | 50/50 Layout, Glassmorphism buttons, Mobile full-bleed. |
| `components/Header.tsx` | Sticky Navigation. | Category search & User links with admin detection. |
| `components/Footer.tsx` | Site Footer. | Benefits, Policies, and multi-column info. |
| `components/ProductCard.tsx` | Dynamic Product Card. | Responsive layout with tech-spec tag badges. |

### Admin Components
| Path | Description | Key Functions |
| :--- | :--- | :--- |
| `components/admin/ProductForm.tsx` | Complex Product Form. | Handles JSONB specs and Cloudinary image logic. |
| `components/admin/SpecManager.tsx` | JSONB Editor. | Dynamic Key-Value editing for product specs. |
| `components/admin/AdminSidebar.tsx` | Sidebar Navigation. | High-quality navigation for administrative routes. |

---

## 4. Data & Logic (src/services,hooks,utils)

| Path | Description | Key Functions |
| :--- | :--- | :--- |
| `services/productService.ts` | Product DAL. | Fully typed Supabase operations for products. |
| `services/bannerService.ts` | Banner DAL. | Supabase operations for Carousel banners. |
| `hooks/useProductForm.ts` | Product State Hook. | Complex form state management & validation. |
| `utils/supabase/` | Supabase Config. | Browser and Server clients for universal access. |
