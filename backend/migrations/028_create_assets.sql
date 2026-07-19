CREATE TABLE assets (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url        TEXT NOT NULL,
    key        TEXT NOT NULL,
    filename   VARCHAR NOT NULL,
    mime_type  VARCHAR NOT NULL,
    size       INTEGER NOT NULL DEFAULT 0,
    alt        JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_assets_deleted_at ON assets(deleted_at);
CREATE INDEX idx_assets_filename ON assets(filename);
