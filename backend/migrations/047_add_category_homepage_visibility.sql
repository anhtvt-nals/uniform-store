ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN NOT NULL DEFAULT FALSE;

-- Preserve the current three homepage category blocks after this migration.
UPDATE categories
SET show_on_homepage = TRUE
WHERE parent_id IS NULL
  AND slug IN (
    'dong-phuc-cong-so',
    'dong-phuc-khach-san',
    'dong-phuc-ao-polo'
  );
