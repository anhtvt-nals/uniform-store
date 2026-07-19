-- ============================================================================
-- Migration 026: Articles (blog / content)
-- ============================================================================

CREATE TABLE article_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,
    name        JSONB NOT NULL,                 -- {en, vi, de}
    description JSONB NOT NULL DEFAULT '{}',
    is_active   BOOLEAN NOT NULL DEFAULT true,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ
);

CREATE TABLE article_tags (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,
    name        JSONB NOT NULL,                 -- {en, vi, de}
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE articles (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug          TEXT NOT NULL UNIQUE,
    title         JSONB NOT NULL,               -- {en, vi, de}
    content       JSONB NOT NULL DEFAULT '{}',  -- rich text HTML
    excerpt       JSONB NOT NULL DEFAULT '{}',  -- short summary
    image_url     TEXT NOT NULL DEFAULT '',
    author        TEXT NOT NULL DEFAULT '',
    is_featured   BOOLEAN NOT NULL DEFAULT false,
    is_published  BOOLEAN NOT NULL DEFAULT false,
    published_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
);

CREATE TABLE article_category_map (
    article_id  UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES article_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, category_id)
);

CREATE TABLE article_tag_map (
    article_id  UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tag_id      UUID NOT NULL REFERENCES article_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- Indexes
CREATE INDEX idx_articles_slug ON articles(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_articles_published ON articles(is_published, published_at DESC) WHERE is_published = true AND deleted_at IS NULL;
CREATE INDEX idx_articles_featured ON articles(is_featured) WHERE is_featured = true AND is_published = true AND deleted_at IS NULL;
CREATE INDEX idx_article_categories_active ON article_categories(is_active) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_article_categories_slug ON article_categories(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_article_tags_slug ON article_tags(slug);

-- Full-text search on articles
CREATE INDEX idx_articles_search ON articles USING GIN(
    to_tsvector('simple',
        COALESCE(title->>'en', '') || ' ' ||
        COALESCE(title->>'vi', '') || ' ' ||
        COALESCE(title->>'de', '') || ' ' ||
        COALESCE(excerpt->>'en', '') || ' ' ||
        COALESCE(excerpt->>'vi', '') || ' ' ||
        COALESCE(excerpt->>'de', '')
    )
) WHERE is_published = true AND deleted_at IS NULL;
