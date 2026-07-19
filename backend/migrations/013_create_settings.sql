-- ============================================================================
-- Migration 013: Settings
-- ============================================================================

CREATE TABLE settings (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key           TEXT NOT NULL UNIQUE,
    value         JSONB NOT NULL DEFAULT '{}',
    group_name    TEXT NOT NULL DEFAULT 'general',
    is_public     BOOLEAN NOT NULL DEFAULT false, -- visible to storefront
    description   TEXT NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_settings_group ON settings(group_name);
CREATE INDEX idx_settings_public ON settings(is_public) WHERE is_public = true;
