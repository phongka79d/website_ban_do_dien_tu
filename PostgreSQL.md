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
    description TEXT
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

-- 6. Sample Data Insertion

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
