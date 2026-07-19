-- ============================================================================
-- Migration 003: Addresses
-- ============================================================================

CREATE TABLE addresses (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name            TEXT NOT NULL,
    company              TEXT NOT NULL DEFAULT '',
    street_line1         TEXT NOT NULL,
    street_line2         TEXT NOT NULL DEFAULT '',
    city                 TEXT NOT NULL DEFAULT '',
    province             TEXT NOT NULL DEFAULT '',
    postal_code          TEXT NOT NULL DEFAULT '',
    country_code         TEXT NOT NULL DEFAULT 'VN',
    phone                TEXT NOT NULL DEFAULT '',
    is_default_shipping  BOOLEAN NOT NULL DEFAULT false,
    is_default_billing   BOOLEAN NOT NULL DEFAULT false,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at           TIMESTAMPTZ
);

-- Only one default shipping/billing per user
CREATE UNIQUE INDEX idx_addresses_default_shipping
    ON addresses(user_id) WHERE is_default_shipping = true AND deleted_at IS NULL;

CREATE UNIQUE INDEX idx_addresses_default_billing
    ON addresses(user_id) WHERE is_default_billing = true AND deleted_at IS NULL;
