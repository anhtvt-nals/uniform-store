-- ============================================================================
-- Migration 030: Add sort_description to products + Create inquiries table
-- ============================================================================

-- Add sort_description (short text) to products
ALTER TABLE products
  ADD COLUMN sort_description JSONB NOT NULL DEFAULT '{}';

-- Inquiries table — customers submit order inquiries per product
CREATE TABLE inquiries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL DEFAULT '',
  company       TEXT NOT NULL DEFAULT '',
  quantity      INTEGER NOT NULL DEFAULT 1,
  notes         TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'pending',   -- pending | contacted | completed | cancelled
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_inquiries_product_id ON inquiries(product_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
