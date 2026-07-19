-- ============================================================================
-- Migration 029: Add detail (rich HTML) column to products table
-- ============================================================================

ALTER TABLE products
  ADD COLUMN detail JSONB NOT NULL DEFAULT '{}';

