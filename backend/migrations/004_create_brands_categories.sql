-- ============================================================================
-- Migration 004: Brands, Categories (nested set)
-- ============================================================================

CREATE TABLE brands (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          JSONB NOT NULL,              -- {en, vi, de}
    slug          TEXT NOT NULL UNIQUE,
    description   JSONB NOT NULL DEFAULT '{}',
    logo_url      TEXT NOT NULL DEFAULT '',
    website_url   TEXT NOT NULL DEFAULT '',
    is_active     BOOLEAN NOT NULL DEFAULT true,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
);

CREATE TABLE categories (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    name          JSONB NOT NULL,              -- {en, vi, de}
    slug          TEXT NOT NULL UNIQUE,
    description   JSONB NOT NULL DEFAULT '{}',
    image_url     TEXT NOT NULL DEFAULT '',
    is_active     BOOLEAN NOT NULL DEFAULT true,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_categories_parent ON categories(parent_id) WHERE deleted_at IS NULL;
