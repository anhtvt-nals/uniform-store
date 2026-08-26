CREATE TABLE sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(32) NOT NULL UNIQUE,
    weight_range VARCHAR(100) NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE product_sizes (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size_id UUID NOT NULL REFERENCES sizes(id) ON DELETE RESTRICT,
    PRIMARY KEY (product_id, size_id)
);

ALTER TABLE products ADD COLUMN size_guide_image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE cart_items ADD COLUMN size_id UUID REFERENCES sizes(id) ON DELETE SET NULL;
ALTER TABLE cart_items ADD COLUMN size_name VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE order_items ADD COLUMN size_id UUID REFERENCES sizes(id) ON DELETE SET NULL;
ALTER TABLE order_items ADD COLUMN size_name VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE inquiries ADD COLUMN size_id UUID REFERENCES sizes(id) ON DELETE SET NULL;
ALTER TABLE inquiries ADD COLUMN size_name VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE quote_requests ADD COLUMN size_name VARCHAR(100) NOT NULL DEFAULT '';

CREATE INDEX idx_sizes_active ON sizes(sort_order) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX idx_product_sizes_product ON product_sizes(product_id);
