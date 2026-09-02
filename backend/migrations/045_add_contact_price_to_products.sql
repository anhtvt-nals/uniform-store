ALTER TABLE products
ADD COLUMN is_contact_price BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_products_contact_price
ON products (is_contact_price)
WHERE deleted_at IS NULL AND is_active = true;
