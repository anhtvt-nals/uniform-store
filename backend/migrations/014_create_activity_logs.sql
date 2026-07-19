-- ============================================================================
-- Migration 014: Activity Logs
-- ============================================================================

CREATE TABLE activity_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    action        TEXT NOT NULL,                -- 'order.created', 'product.updated', etc.
    entity_type   TEXT NOT NULL,                -- 'order', 'product', 'user', etc.
    entity_id     UUID,
    old_values    JSONB NOT NULL DEFAULT '{}',
    new_values    JSONB NOT NULL DEFAULT '{}',
    ip_address    INET,
    user_agent    TEXT NOT NULL DEFAULT '',
    metadata      JSONB NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
