-- ============================================================================
-- Migration 025: Facets
-- ============================================================================
-- Facets enable search-sidebar filtering with aggregated counts.
-- Separate from product options: facets are for search/filter,
-- options are for variant configuration.
-- ============================================================================

CREATE TABLE facet_groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        TEXT NOT NULL UNIQUE,           -- 'size', 'material', 'color', 'sleeve_length'
    name        JSONB NOT NULL,                 -- {en, vi, de}
    is_active   BOOLEAN NOT NULL DEFAULT true,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE facet_values (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id    UUID NOT NULL REFERENCES facet_groups(id) ON DELETE CASCADE,
    code        TEXT NOT NULL UNIQUE,           -- 's', 'm', 'l', 'cotton', 'polyester'
    name        JSONB NOT NULL,                 -- {en, vi, de}
    is_active   BOOLEAN NOT NULL DEFAULT true,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_facet_values (
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    facet_value_id  UUID NOT NULL REFERENCES facet_values(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, facet_value_id)
);

-- Seed common facet groups
INSERT INTO facet_groups (id, code, name, sort_order) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'size',       '{"en": "Size", "vi": "Kích Thước", "de": "Größe"}', 1),
    ('a0000000-0000-0000-0000-000000000002', 'color',      '{"en": "Color", "vi": "Màu Sắc", "de": "Farbe"}', 2),
    ('a0000000-0000-0000-0000-000000000003', 'material',   '{"en": "Material", "vi": "Chất Liệu", "de": "Material"}', 3),
    ('a0000000-0000-0000-0000-000000000004', 'sleeve',     '{"en": "Sleeve Length", "vi": "Chiều Dài Tay Áo", "de": "Ärmellänge"}', 4),
    ('a0000000-0000-0000-0000-000000000005', 'fit',        '{"en": "Fit", "vi": "Kiểu Dáng", "de": "Passform"}', 5);

-- Seed facet values: sizes
INSERT INTO facet_values (id, group_id, code, name, sort_order) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 's',     '{"en": "S", "vi": "S", "de": "S"}', 1),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'm',     '{"en": "M", "vi": "M", "de": "M"}', 2),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'l',     '{"en": "L", "vi": "L", "de": "L"}', 3),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'xl',    '{"en": "XL", "vi": "XL", "de": "XL"}', 4),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'xxl',   '{"en": "XXL", "vi": "XXL", "de": "XXL"}', 5);

-- Seed facet values: colors
INSERT INTO facet_values (id, group_id, code, name, sort_order) VALUES
    ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000002', 'white',     '{"en": "White", "vi": "Trắng", "de": "Weiß"}', 1),
    ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000002', 'black',     '{"en": "Black", "vi": "Đen", "de": "Schwarz"}', 2),
    ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000002', 'navy',      '{"en": "Navy", "vi": "Xanh Navy", "de": "Marineblau"}', 3),
    ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000002', 'gray',      '{"en": "Gray", "vi": "Xám", "de": "Grau"}', 4),
    ('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000002', 'khaki',     '{"en": "Khaki", "vi": "Ka Ki", "de": "Khaki"}', 5);

-- Seed facet values: materials
INSERT INTO facet_values (id, group_id, code, name, sort_order) VALUES
    ('b0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000003', 'cotton',        '{"en": "Cotton", "vi": "Cotton", "de": "Baumwolle"}', 1),
    ('b0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000003', 'polyester',     '{"en": "Polyester", "vi": "Polyester", "de": "Polyester"}', 2),
    ('b0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000003', 'cotton-poly',   '{"en": "Cotton-Polyester Blend", "vi": "Pha Cotton-Polyester", "de": "Baumwoll-Polyester-Mischung"}', 3);

-- Seed facet values: sleeve
INSERT INTO facet_values (id, group_id, code, name, sort_order) VALUES
    ('b0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000004', 'short-sleeve',  '{"en": "Short Sleeve", "vi": "Tay Ngắn", "de": "Kurzarm"}', 1),
    ('b0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000004', 'long-sleeve',   '{"en": "Long Sleeve", "vi": "Tay Dài", "de": "Langarm"}', 2);

-- Seed facet values: fit
INSERT INTO facet_values (id, group_id, code, name, sort_order) VALUES
    ('b0000000-0000-0000-0000-000000000041', 'a0000000-0000-0000-0000-000000000005', 'regular',  '{"en": "Regular Fit", "vi": "Vừa Vặn", "de": "Reguläre Passform"}', 1),
    ('b0000000-0000-0000-0000-000000000042', 'a0000000-0000-0000-0000-000000000005', 'slim',     '{"en": "Slim Fit", "vi": "Ôm Sát", "de": "Schlanke Passform"}', 2),
    ('b0000000-0000-0000-0000-000000000043', 'a0000000-0000-0000-0000-000000000005', 'relaxed',  '{"en": "Relaxed Fit", "vi": "Thoải Mái", "de": "Lockere Passform"}', 3);

CREATE INDEX idx_facet_groups_active ON facet_groups(is_active) WHERE is_active = true;
CREATE INDEX idx_facet_values_group ON facet_values(group_id) WHERE is_active = true;
CREATE INDEX idx_facet_values_code ON facet_values(code);
CREATE INDEX idx_product_facets_product ON product_facet_values(product_id);
CREATE INDEX idx_product_facets_value ON product_facet_values(facet_value_id);
