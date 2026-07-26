-- ══════════════════════════════════════════════════════════════
-- Migration: Convert Storage URLs to Keys
-- Strip domain prefixes to store only relative keys
-- This allows changing STORAGE_PUBLIC_URL without database migration
-- ══════════════════════════════════════════════════════════════

-- Strip URLs from product_images.url
UPDATE product_images
SET url = REGEXP_REPLACE(url, '^https?://[^/]+/', '')
WHERE url ~ '^https?://';

-- Strip URLs from categories.image_url
UPDATE categories
SET image_url = REGEXP_REPLACE(image_url, '^https?://[^/]+/', '')
WHERE image_url ~ '^https?://';

-- Strip URLs from brands.logo_url  
UPDATE brands
SET logo_url = REGEXP_REPLACE(logo_url, '^https?://[^/]+/', '')
WHERE logo_url ~ '^https?://';

-- Strip URLs from customer_contracts.image_url
UPDATE customer_contracts
SET image_url = REGEXP_REPLACE(image_url, '^https?://[^/]+/', '')
WHERE image_url ~ '^https?://';

-- Strip URLs from assets table
UPDATE assets
SET url = REGEXP_REPLACE(url, '^https?://[^/]+/', '')
WHERE url ~ '^https?://';

UPDATE assets
SET preview_url = REGEXP_REPLACE(preview_url, '^https?://[^/]+/', '')
WHERE preview_url ~ '^https?://';

-- Verify results (should show relative keys only)
-- SELECT url FROM product_images LIMIT 5;
-- Should see: "products/123/image.jpg" instead of "https://storage.electroai.shop/products/123/image.jpg"
