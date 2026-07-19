-- ============================================================================
-- Migration 009: Coupons & Discounts
-- ============================================================================
-- Discounts define the rule. Coupons are codes that trigger a discount.
-- A discount can be automatic (no coupon) or require a coupon code.
-- ============================================================================

CREATE TABLE discounts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              JSONB NOT NULL,            -- {en, vi, de}
    type              TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value             INTEGER NOT NULL,          -- cents for fixed, percentage * 100 for pct (e.g. 1500 = 15.00%)
    min_order_amount  INTEGER NOT NULL DEFAULT 0,-- cents, minimum order to apply
    max_discount      INTEGER NOT NULL DEFAULT 0,-- cents, 0 = no cap (for percentage type)
    target            TEXT NOT NULL DEFAULT 'order'
                      CHECK (target IN ('order', 'product', 'category')),
    target_ids        UUID[] NOT NULL DEFAULT '{}',-- product_ids or category_ids if target != 'order'
    max_uses          INTEGER NOT NULL DEFAULT 0, -- 0 = unlimited
    current_uses      INTEGER NOT NULL DEFAULT 0,
    starts_at         TIMESTAMPTZ,
    ends_at           TIMESTAMPTZ,
    is_active         BOOLEAN NOT NULL DEFAULT true,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ
);

CREATE TABLE coupons (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_id   UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
    code          TEXT NOT NULL UNIQUE,
    max_uses      INTEGER NOT NULL DEFAULT 0,
    current_uses  INTEGER NOT NULL DEFAULT 0,
    per_user_limit INTEGER NOT NULL DEFAULT 0, -- 0 = unlimited per user
    starts_at     TIMESTAMPTZ,
    ends_at       TIMESTAMPTZ,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
);

CREATE TABLE coupon_usages (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id     UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    order_id      UUID REFERENCES orders(id) ON DELETE SET NULL,
    used_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupons_code ON coupons(code) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_discounts_active ON discounts(is_active) WHERE deleted_at IS NULL;
