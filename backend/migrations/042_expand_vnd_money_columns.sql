-- ============================================================================
-- Migration 042: Store VND monetary values as BIGINT
-- ============================================================================
-- Prices are stored in VND (not cents). A valid B2B order can therefore exceed
-- PostgreSQL INTEGER's 2,147,483,647 limit when its line totals are calculated.
-- BIGINT supports values up to 9,223,372,036,854,775,807 VND.

ALTER TABLE products
    ALTER COLUMN base_price TYPE BIGINT USING base_price::BIGINT;

ALTER TABLE product_variants
    ALTER COLUMN price TYPE BIGINT USING price::BIGINT,
    ALTER COLUMN compare_price TYPE BIGINT USING compare_price::BIGINT;

ALTER TABLE cart_items
    ALTER COLUMN unit_price TYPE BIGINT USING unit_price::BIGINT;

ALTER TABLE cart_coupons
    ALTER COLUMN discount_amount TYPE BIGINT USING discount_amount::BIGINT;

ALTER TABLE orders
    ALTER COLUMN subtotal TYPE BIGINT USING subtotal::BIGINT,
    ALTER COLUMN discount_total TYPE BIGINT USING discount_total::BIGINT,
    ALTER COLUMN shipping_total TYPE BIGINT USING shipping_total::BIGINT,
    ALTER COLUMN tax_total TYPE BIGINT USING tax_total::BIGINT,
    ALTER COLUMN grand_total TYPE BIGINT USING grand_total::BIGINT;

ALTER TABLE order_items
    ALTER COLUMN unit_price TYPE BIGINT USING unit_price::BIGINT,
    ALTER COLUMN line_price TYPE BIGINT USING line_price::BIGINT;

ALTER TABLE order_payments
    ALTER COLUMN amount TYPE BIGINT USING amount::BIGINT;

ALTER TABLE order_discounts
    ALTER COLUMN amount TYPE BIGINT USING amount::BIGINT;

ALTER TABLE discounts
    ALTER COLUMN value TYPE BIGINT USING value::BIGINT,
    ALTER COLUMN min_order_amount TYPE BIGINT USING min_order_amount::BIGINT,
    ALTER COLUMN max_discount TYPE BIGINT USING max_discount::BIGINT;

ALTER TABLE shipping_methods
    ALTER COLUMN price TYPE BIGINT USING price::BIGINT,
    ALTER COLUMN min_order_amount TYPE BIGINT USING min_order_amount::BIGINT;
