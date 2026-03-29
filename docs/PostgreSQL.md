-- PostgreSQL Database Schema for AntigravityS Electronics Store

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Brands Table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT
);

-- 4. Create Products Table (using JSONB for flexible specs)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    category_slug VARCHAR(100) REFERENCES categories(slug) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price BIGINT NOT NULL CHECK (price >= 0),
    original_price BIGINT CHECK (original_price >= price),
    discount_percentage INT GENERATED ALWAYS AS (
        CASE WHEN original_price > 0 THEN (100 * (original_price - price) / original_price) ELSE 0 END
    ) STORED,
    image_url TEXT,
    specs JSONB NOT NULL DEFAULT '{}',
    rating DECIMAL(2,1) DEFAULT 0.0,
    reviews_count INT DEFAULT 0,
    promotion_text TEXT,
    has_installment_0 BOOLEAN DEFAULT false,
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Product Images Table (for multiple images/slides)
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Performance Indexes
CREATE INDEX idx_products_category ON products(category_slug);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_specs ON products USING GIN (specs);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- 6. Create Banners Table (for Carousel)
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    bg_color VARCHAR(100) DEFAULT 'bg-gradient-to-r from-slate-900 to-slate-800',
    target_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_banners_active_order ON banners(is_active, display_order);

-- 7. Auth & RBAC Tables
-- ------------------------------------------

-- Profiles table (Syncs with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. Triggers & Functions
-- ------------------------------------------

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, phone, is_active, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
    NEW.raw_user_meta_data->>'phone',
    TRUE,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync auth.users with public.profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Sample Data Insertion

-- Brands
INSERT INTO brands (name) VALUES 
('Sony'), ('Logitech'), ('Samsung'), ('Corsair'), ('Marshall');

-- Categories
INSERT INTO categories (name, slug) VALUES 
('Headphones', 'headphones'),
('Mouse', 'mouse'),
('Hard Drive', 'hard-drive'),
('RAM', 'ram'),
('Speaker', 'speaker');

-- Products
INSERT INTO products (brand_id, category_slug, name, price, original_price, image_url, specs, rating, reviews_count, promotion_text, has_installment_0)
VALUES 
(
    (SELECT id FROM brands WHERE name = 'Sony'),
    'headphones',
    'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    8490000, 9490000,
    'https://example.com/sony-xm5.png',
    '{"connection": "Bluetooth 5.2", "battery_life": "30 hours", "noise_canceling": true}',
    4.8, 320, 'Free Sony carrying case included', true
),
(
    (SELECT id FROM brands WHERE name = 'Logitech'),
    'mouse',
    'Logitech G Pro X Superlight Wireless Gaming Mouse',
    3190000, 3890000,
    'https://example.com/logitech-gpro.png',
    '{"weight": "63g", "sensor": "HERO 25K", "max_dpi": 25600}',
    4.9, 156, 'Voucher 200k for gaming gear', false
);

-- Banners
INSERT INTO banners (title, subtitle, image_url, bg_color, target_url, display_order) VALUES 
(
    'iPhone 15 Pro Max', 
    'Titanium siêu bền. Chip A17 Pro đỉnh cao.', 
    'https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png',
    'bg-gradient-to-r from-slate-900 to-slate-800',
    '/product/iphone-15-pro-max',
    1
),
(
    'Galaxy S24 Series', 
    'Quyền năng AI. Ưu đãi đến 10 triệu đồng.', 
    'https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/s/ss-s24-ultra-xam-2_1.png',
    'bg-gradient-to-r from-indigo-900 to-blue-900',
    '/category/samsung',
    2
),
(
    'Mở bán MacBook M3', 
    'Hiệu năng bứt phá. Trẻ trung sáng tạo.', 
    'https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook-air-m3-13-inch-silver.png',
    'bg-gradient-to-r from-secondary/80 to-primary/80',
    '/category/macbook',
    3
);

-- 10. Create Carts Table (One per user)
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Create Cart Items Table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, product_id)
);

-- 12. Row Level Security (RLS)
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policies for Carts
CREATE POLICY "Users can view their own cart" ON carts 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cart" ON carts 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for Cart Items
CREATE POLICY "Users can view their own cart items" ON cart_items
    FOR SELECT USING (
        cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
    );
CREATE POLICY "Users can insert their own cart items" ON cart_items
    FOR INSERT WITH CHECK (
        cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
    );
CREATE POLICY "Users can update their own cart items" ON cart_items
    FOR UPDATE USING (
        cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
    );
CREATE POLICY "Users can delete their own cart items" ON cart_items
    FOR DELETE USING (
        cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
    );

-- ==========================================
-- MIGRATION LOGS
-- ==========================================

-- 2026-03-28: Thêm trường image_url cho categories
-- 2026-03-29: Thêm hệ thống Giỏ hàng (Carts & Cart Items)

