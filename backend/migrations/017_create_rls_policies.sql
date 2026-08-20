-- ============================================================================
-- Migration 017: Authorization is enforced by the NestJS API
-- ============================================================================
-- The storefront never connects to Supabase directly. Customer identity is
-- verified by custom JWT guards in the API, so Supabase Auth-dependent RLS
-- policies and auth.uid() must not be installed in this database.
-- ============================================================================

SELECT 1;
