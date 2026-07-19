-- ============================================================================
-- Migration 015: Performance Indexes
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Addresses
CREATE INDEX idx_addresses_user ON addresses(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_addresses_country ON addresses(country_code);

-- Brands
CREATE INDEX idx_brands_slug ON brands(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_brands_active ON brands(is_active) WHERE deleted_at IS NULL;

-- Categories
CREATE INDEX idx_categories_slug ON categories(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_active ON categories(is_active) WHERE deleted_at IS NULL;

-- Products
CREATE INDEX idx_products_slug ON products(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category ON products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_brand ON products(brand_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_active ON products(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true AND deleted_at IS NULL;
CREATE INDEX idx_products_price ON products(base_price) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_created ON products(created_at DESC) WHERE deleted_at IS NULL;

-- Product variants
CREATE INDEX idx_variants_product ON product_variants(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_variants_sku ON product_variants(sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_variants_active ON product_variants(is_active) WHERE deleted_at IS NULL;

-- Product images
CREATE INDEX idx_product_images_product ON product_images(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_images_variant ON product_images(variant_id) WHERE deleted_at IS NULL AND variant_id IS NOT NULL;

-- Product options
CREATE INDEX idx_option_groups_product ON product_option_groups(product_id);
CREATE INDEX idx_options_group ON product_options(group_id);

-- Inventory
CREATE INDEX idx_inventory_variant ON inventory(variant_id);
CREATE INDEX idx_inventory_low_stock ON inventory((quantity - reserved)) WHERE track_inventory = true AND (quantity - reserved) <= low_stock_level;

-- Orders
CREATE INDEX idx_orders_user ON orders(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_code ON orders(code);
CREATE INDEX idx_orders_status ON orders(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_created ON orders(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_email ON orders(email) WHERE deleted_at IS NULL;

-- Order items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_variant ON order_items(variant_id);

-- Order addresses
CREATE INDEX idx_order_addresses_order ON order_addresses(order_id);

-- Order payments
CREATE INDEX idx_order_payments_order ON order_payments(order_id);

-- Order status history
CREATE INDEX idx_order_history_order ON order_status_history(order_id);

-- Reviews
CREATE INDEX idx_reviews_approved ON reviews(product_id, rating) WHERE is_approved = true AND deleted_at IS NULL;

-- Wishlists
CREATE INDEX idx_wishlists_user_product ON wishlists(user_id, product_id);

-- Banners
CREATE INDEX idx_banners_sorted ON banners(sort_order) WHERE is_active = true AND deleted_at IS NULL;

-- Settings
CREATE INDEX idx_settings_key ON settings(key);

-- Full-text search on products (multi-locale)
CREATE INDEX idx_products_search ON products USING GIN(
    to_tsvector('simple',
        COALESCE(name->>'en', '') || ' ' ||
        COALESCE(name->>'vi', '') || ' ' ||
        COALESCE(name->>'de', '') || ' ' ||
        COALESCE(description->>'en', '') || ' ' ||
        COALESCE(description->>'vi', '') || ' ' ||
        COALESCE(description->>'de', '')
    )
) WHERE deleted_at IS NULL;

-- Trigram indexes for fuzzy search
CREATE INDEX idx_products_name_trgm ON products USING GIN(
    to_tsvector('simple', COALESCE(name->>'en', '') || ' ' || COALESCE(name->>'vi', ''))
) WHERE deleted_at IS NULL;
