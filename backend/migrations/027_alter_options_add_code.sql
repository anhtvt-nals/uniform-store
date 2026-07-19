-- ============================================================================
-- Migration 027: Add code column to option groups and options
-- ============================================================================
-- The code field enables URL-based variant selection in the frontend
-- (e.g., ?options=size:xl,color:red). Frontend expects { code, name } on
-- both option groups and options.
-- ============================================================================

ALTER TABLE product_option_groups ADD COLUMN code TEXT NOT NULL DEFAULT '';
ALTER TABLE product_options ADD COLUMN code TEXT NOT NULL DEFAULT '';

CREATE INDEX idx_option_groups_code ON product_option_groups(code);
CREATE INDEX idx_options_code ON product_options(code);
