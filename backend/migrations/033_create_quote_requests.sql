CREATE TABLE quote_requests (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR NOT NULL,
    phone         VARCHAR NOT NULL,
    email         VARCHAR DEFAULT '',
    region        VARCHAR DEFAULT '',
    address       TEXT DEFAULT '',
    product_type  TEXT DEFAULT '',
    quantity      INT DEFAULT 1,
    status        VARCHAR DEFAULT 'NEW',
    sales_note    TEXT DEFAULT '',
    source        VARCHAR DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_created_at ON quote_requests(created_at);
