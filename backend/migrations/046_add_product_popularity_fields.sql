ALTER TABLE products
ADD COLUMN sold_count INTEGER NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_products_homepage_order
ON products (display_order DESC, sold_count DESC, created_at DESC)
WHERE deleted_at IS NULL AND is_active = true;
