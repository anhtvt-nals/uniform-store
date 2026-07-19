-- ============================================================================
-- Migration 007: Cart
-- ============================================================================

CREATE TABLE carts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id    TEXT,                          -- for guest carts (UUID string)
    status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'converted', 'abandoned')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT cart_owner_check CHECK (
        (user_id IS NOT NULL AND session_id IS NULL)
        OR (user_id IS NULL AND session_id IS NOT NULL)
        OR (user_id IS NOT NULL AND session_id IS NOT NULL) -- merged carts
    )
);

CREATE TABLE cart_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id       UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    variant_id    UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity      INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price    INTEGER NOT NULL DEFAULT 0,   -- cents, locked at add time
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cart_coupons (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id       UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    coupon_code   TEXT NOT NULL,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(cart_id, coupon_code)
);

CREATE INDEX idx_carts_user ON carts(user_id) WHERE status = 'active';
CREATE INDEX idx_carts_session ON carts(session_id) WHERE status = 'active';
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
