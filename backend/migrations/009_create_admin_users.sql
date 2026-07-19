-- ============================================================================
-- Migration 009: Admin Users (separate from storefront users)
-- ============================================================================
-- Admin uses a separate table with bcrypt-hashed passwords, not Supabase Auth.
-- ============================================================================

CREATE TABLE admin_users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'editor'
        CHECK (role IN ('super_admin', 'admin', 'editor')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
