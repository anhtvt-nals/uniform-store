-- ============================================================================
-- Migration 006: Inventory
-- ============================================================================

CREATE TABLE inventory (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id      UUID NOT NULL UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL DEFAULT 0,
    reserved        INTEGER NOT NULL DEFAULT 0, -- items in active carts/checkout
    low_stock_level INTEGER NOT NULL DEFAULT 5,
    track_inventory BOOLEAN NOT NULL DEFAULT true,
    allow_backorder BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Available = quantity - reserved
CREATE VIEW inventory_available AS
SELECT
    id,
    variant_id,
    quantity,
    reserved,
    (quantity - reserved) AS available,
    low_stock_level,
    track_inventory,
    allow_backorder
FROM inventory;
