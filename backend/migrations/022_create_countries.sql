-- ============================================================================
-- Migration 022: Countries
-- ============================================================================
-- Reference data for address forms, shipping calculations.
-- ISO 3166-1 alpha-2 codes.
-- ============================================================================

CREATE TABLE countries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        TEXT NOT NULL UNIQUE,           -- ISO 3166-1 alpha-2: VN, US, DE
    name        JSONB NOT NULL,                 -- {en, vi, de}
    phone_code  TEXT NOT NULL DEFAULT '',       -- +84, +1, +49
    is_active   BOOLEAN NOT NULL DEFAULT true,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed data: primary markets
INSERT INTO countries (id, code, name, phone_code, is_active, sort_order) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'VN', '{"en": "Vietnam", "vi": "Việt Nam", "de": "Vietnam"}', '+84', true, 1),
    ('d0000000-0000-0000-0000-000000000002', 'US', '{"en": "United States", "vi": "Hoa Kỳ", "de": "Vereinigte Staaten"}', '+1', true, 2),
    ('d0000000-0000-0000-0000-000000000003', 'DE', '{"en": "Germany", "vi": "Đức", "de": "Deutschland"}', '+49', true, 3);

CREATE INDEX idx_countries_code ON countries(code) WHERE is_active = true;
CREATE INDEX idx_countries_sort ON countries(sort_order);
