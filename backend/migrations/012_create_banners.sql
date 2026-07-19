-- ============================================================================
-- Migration 012: Banners
-- ============================================================================

CREATE TABLE banners (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         JSONB NOT NULL,              -- {en, vi, de}
    subtitle      JSONB NOT NULL DEFAULT '{}',
    image_url     TEXT NOT NULL DEFAULT '',
    link_url      TEXT NOT NULL DEFAULT '',
    position      TEXT NOT NULL DEFAULT 'hero'
                  CHECK (position IN ('hero', 'promo', 'sidebar', 'footer')),
    is_active     BOOLEAN NOT NULL DEFAULT true,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    starts_at     TIMESTAMPTZ,
    ends_at       TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_banners_position ON banners(position) WHERE is_active = true AND deleted_at IS NULL;
