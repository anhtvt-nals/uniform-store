-- ============================================================================
-- Migration 034: Create customer_contracts table
-- ============================================================================

CREATE TABLE customer_contracts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  logo_url      TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customer_contracts_active ON customer_contracts(is_active);
CREATE INDEX idx_customer_contracts_order ON customer_contracts(display_order);
