CREATE TABLE stock_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id      UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    reason_code     VARCHAR(50),
    reason          TEXT,
    quantity_change INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after  INTEGER NOT NULL,
    reserved_before INTEGER NOT NULL DEFAULT 0,
    reserved_after  INTEGER NOT NULL DEFAULT 0,
    reference       TEXT,
    created_by      VARCHAR(100),
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_history_variant ON stock_history(variant_id);
CREATE INDEX idx_stock_history_created ON stock_history(created_at DESC);
CREATE INDEX idx_stock_history_type ON stock_history(type);
