-- ============================================================================
-- Migration 035: Add contract_image_url to customer_contracts
-- ============================================================================

ALTER TABLE customer_contracts
  ADD COLUMN contract_image_url TEXT NOT NULL DEFAULT '';
