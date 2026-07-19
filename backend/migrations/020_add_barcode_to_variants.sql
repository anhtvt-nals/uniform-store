-- ============================================================================
-- Migration 020: Add barcode to product_variants
-- ============================================================================

ALTER TABLE product_variants ADD COLUMN barcode TEXT NOT NULL DEFAULT '';

CREATE INDEX idx_variants_barcode ON product_variants(barcode) WHERE deleted_at IS NULL;
