-- ============================================================================
-- Migration 008: Orders, Order Items, Payments, Status History
-- ============================================================================

CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                TEXT NOT NULL UNIQUE,
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    email               TEXT NOT NULL DEFAULT '',
    status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN (
                            'pending', 'confirmed', 'processing',
                            'shipped', 'delivered', 'cancelled', 'refunded'
                        )),
    currency_code       TEXT NOT NULL DEFAULT 'VND',
    subtotal            INTEGER NOT NULL DEFAULT 0,  -- cents
    discount_total      INTEGER NOT NULL DEFAULT 0,
    shipping_total      INTEGER NOT NULL DEFAULT 0,
    tax_total           INTEGER NOT NULL DEFAULT 0,
    grand_total         INTEGER NOT NULL DEFAULT 0,
    notes               TEXT NOT NULL DEFAULT '',
    shipping_method     TEXT NOT NULL DEFAULT '',
    payment_method      TEXT NOT NULL DEFAULT '',
    ip_address          INET,
    user_agent          TEXT NOT NULL DEFAULT '',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ
);

CREATE TABLE order_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id    UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    product_name  JSONB NOT NULL,             -- snapshot: {en, vi, de}
    variant_name  JSONB NOT NULL,             -- snapshot
    sku           TEXT NOT NULL,
    quantity      INTEGER NOT NULL CHECK (quantity > 0),
    unit_price    INTEGER NOT NULL,           -- cents, snapshot at order time
    line_price    INTEGER NOT NULL,           -- quantity * unit_price
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_addresses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    type          TEXT NOT NULL CHECK (type IN ('shipping', 'billing')),
    full_name     TEXT NOT NULL,
    company       TEXT NOT NULL DEFAULT '',
    street_line1  TEXT NOT NULL,
    street_line2  TEXT NOT NULL DEFAULT '',
    city          TEXT NOT NULL DEFAULT '',
    province      TEXT NOT NULL DEFAULT '',
    postal_code   TEXT NOT NULL DEFAULT '',
    country_code  TEXT NOT NULL DEFAULT 'VN',
    phone         TEXT NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    method          TEXT NOT NULL,
    amount          INTEGER NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')),
    transaction_id  TEXT NOT NULL DEFAULT '',
    gateway_response JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_discounts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    coupon_code   TEXT NOT NULL DEFAULT '',
    description   TEXT NOT NULL,
    amount        INTEGER NOT NULL,            -- cents
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_status_history (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status   TEXT,
    to_status     TEXT NOT NULL,
    note          TEXT NOT NULL DEFAULT '',
    performed_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order code sequence: MA-YYYYMMDD-NNNN
CREATE SEQUENCE order_code_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT;
    seq_part TEXT;
BEGIN
    date_part := to_char(now(), 'YYYYMMDD');
    seq_part := LPAD(nextval('order_code_seq')::TEXT, 4, '0');
    NEW.code := 'MA-' || date_part || '-' || seq_part;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_order_code
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.code = '' OR NEW.code IS NULL)
    EXECUTE FUNCTION generate_order_code();
