-- ============================================================================
-- Migration 005: Products, Variants, Options, Images
-- ============================================================================

CREATE TABLE products (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    brand_id      UUID REFERENCES brands(id) ON DELETE SET NULL,
    name          JSONB NOT NULL,              -- {en, vi, de}
    slug          TEXT NOT NULL UNIQUE,
    description   JSONB NOT NULL DEFAULT '{}',
    sku           TEXT NOT NULL DEFAULT '',
    base_price    INTEGER NOT NULL DEFAULT 0,  -- cents, lowest variant price
    tax_rate      DECIMAL NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    is_featured   BOOLEAN NOT NULL DEFAULT false,
    weight        INTEGER NOT NULL DEFAULT 0,  -- grams
    meta_title    JSONB NOT NULL DEFAULT '{}',
    meta_desc     JSONB NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
);

CREATE TABLE product_variants (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name          JSONB NOT NULL,              -- {en, vi, de}
    sku           TEXT NOT NULL UNIQUE,
    price         INTEGER NOT NULL,            -- cents
    compare_price INTEGER,                     -- original price for sale display
    tax_rate      DECIMAL NOT NULL DEFAULT 0,
    weight        INTEGER NOT NULL DEFAULT 0,  -- grams
    is_active     BOOLEAN NOT NULL DEFAULT true,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
);

CREATE TABLE product_option_groups (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name          JSONB NOT NULL,              -- {en, vi, de}
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_options (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id      UUID NOT NULL REFERENCES product_option_groups(id) ON DELETE CASCADE,
    name          JSONB NOT NULL,              -- {en, vi, de}
    value         JSONB NOT NULL DEFAULT '{}', -- {en, vi, de}
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_variant_options (
    variant_id    UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    option_id     UUID NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
    PRIMARY KEY (variant_id, option_id)
);

CREATE TABLE product_images (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id    UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    url           TEXT NOT NULL,
    alt           JSONB NOT NULL DEFAULT '{}', -- {en, vi, de}
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
);
