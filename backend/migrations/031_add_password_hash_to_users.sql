-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Remove FK constraint to auth.users (no longer using Supabase Auth)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
