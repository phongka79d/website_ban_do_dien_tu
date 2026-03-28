# Database Design: General Electronics Platform

This document defines the relational database schema used for the AntigravityS electronics platform, optimized for PostgreSQL.

## 1. Schema Overview
The architecture uses a structured relational model for core entities (Brands, Categories) combined with a flexible **JSONB** model for product-specific technical specifications.

## 2. Table Definitions

### 2.1 `brands`
Stores information about product manufacturers.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier |
| `name` | VARCHAR(100) | Brand name (Unique) |
| `logo_url` | TEXT | URL to brand logo |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### 2.2 `categories`
Defines product groupings.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier |
| `name` | VARCHAR(100) | Category name (Unique) |
| `slug` | VARCHAR(100) | SEO-friendly unique slug |
| `description` | TEXT | Category description |

### 2.3 `products`
The central table for product data.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier |
| `brand_id` | UUID (FK) | Reference to `brands.id` |
| `category_slug` | VARCHAR (FK) | Reference to `categories.slug` |
| `name` | VARCHAR(255) | Full product name |
| `price` | BIGINT | Current selling price |
| `original_price` | BIGINT | Price before discount |
| `discount_percentage` | INT | Auto-generated discount % |
| `image_url` | TEXT | Primary thumbnail URL |
| `specs` | **JSONB** | Flexible technical specifications |
| `rating` | NUMERIC(2,1) | Average rating (0.0 - 5.0) |
| `reviews_count` | INT | Total number of reviews |
| `promotion_text` | TEXT | Special offer description |
| `has_installment_0` | BOOLEAN | 0% interest availability |
| `stock_quantity` | INT | Current inventory level |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### 2.4 `product_images`
Supports multiple images/slides for each product.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier |
| `product_id` | UUID (FK) | Reference to `products.id` |
| `image_url` | TEXT | Image URL |
| `is_primary` | BOOLEAN | Set to true for main image |
| `display_order` | INT | Sorting order for galleries |

### 2.5 `banners`
Stores items for the homepage carousel/slider.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier |
| `title` | VARCHAR(255) | Main headline text |
| `subtitle` | TEXT | Description/Sub-text |
| `image_url` | TEXT | Image URL for the banner |
| `bg_color` | VARCHAR(100) | Background color or gradient class |
| `target_url` | TEXT | Navigation link when clicked |
| `is_active` | BOOLEAN | Toggle visibility |
| `display_order` | INT | Sorting priority |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `display_order` | INT | Sorting priority |

### 2.6 `profiles`
Extended user information, synchronized with Supabase Auth.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Foreign Key to `auth.users` |
| `email` | TEXT (Unique) | User's email address |
| `full_name` | TEXT | User's display name |
| `avatar_url` | TEXT | Profile picture URL |
| `phone` | TEXT (Unique) | User's phone number |
| `is_active` | BOOLEAN | Account status (Default: TRUE) |
| `role` | VARCHAR(20) | User role: `user` or `admin` |
| `updated_at` | TIMESTAMPTZ | Last profile update |

## 3. JSONB Specification Examples
The `specs` column allows for category-specific data without schema changes.

- **Headphones**: `{"connection": "Bluetooth 5.2", "noise_canceling": true}`
- **RAM**: `{"capacity": "16GB", "speed": "3200MHz", "type": "DDR4"}`
- **Mouse**: `{"weight": "63g", "sensor": "HERO 25K"}`

## 4. Performance Optimization
- **GIN Index**: Applied to `products(specs)` for efficient JSON searching.
- **B-Tree Indexes**: Applied to `price`, `category_slug`, and `brand_id` for fast filtering.
- **Trigger Sync**: Database function `handle_new_user()` ensures `public.profiles` is always in sync with `auth.users`.
- **Primary-Foreign Keys**: Enforced to ensure data integrity across all entities.
