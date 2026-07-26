-- ══════════════════════════════════════════════════════════════
-- Migration: Fix Storage URLs
-- Replace localhost MinIO URLs with production subdomain
-- ══════════════════════════════════════════════════════════════

-- Update product images
UPDATE product_images
SET url = REPLACE(url, 'http://localhost:9000', 'https://storage.electroai.shop')
WHERE url LIKE 'http://localhost:9000%';

UPDATE product_images
SET url = REPLACE(url, 'http://127.0.0.1:9000', 'https://storage.electroai.shop')
WHERE url LIKE 'http://127.0.0.1:9000%';

-- Update categories (if they have image_url)
UPDATE categories
SET image_url = REPLACE(image_url, 'http://localhost:9000', 'https://storage.electroai.shop')
WHERE image_url LIKE 'http://localhost:9000%';

UPDATE categories
SET image_url = REPLACE(image_url, 'http://127.0.0.1:9000', 'https://storage.electroai.shop')
WHERE image_url LIKE 'http://127.0.0.1:9000%';

-- Update brands (if they have logo_url)
UPDATE brands
SET logo_url = REPLACE(logo_url, 'http://localhost:9000', 'https://storage.electroai.shop')
WHERE logo_url LIKE 'http://localhost:9000%';

UPDATE brands
SET logo_url = REPLACE(logo_url, 'http://127.0.0.1:9000', 'https://storage.electroai.shop')
WHERE logo_url LIKE 'http://127.0.0.1:9000%';

-- Update customer contracts (if they have image_url)
UPDATE customer_contracts
SET image_url = REPLACE(image_url, 'http://localhost:9000', 'https://storage.electroai.shop')
WHERE image_url LIKE 'http://localhost:9000%';

UPDATE customer_contracts
SET image_url = REPLACE(image_url, 'http://127.0.0.1:9000', 'https://storage.electroai.shop')
WHERE image_url LIKE 'http://127.0.0.1:9000%';

-- Update assets table
UPDATE assets
SET url = REPLACE(url, 'http://localhost:9000', 'https://storage.electroai.shop')
WHERE url LIKE 'http://localhost:9000%';

UPDATE assets
SET url = REPLACE(url, 'http://127.0.0.1:9000', 'https://storage.electroai.shop')
WHERE url LIKE 'http://127.0.0.1:9000%';

UPDATE assets
SET preview_url = REPLACE(preview_url, 'http://localhost:9000', 'https://storage.electroai.shop')
WHERE preview_url LIKE 'http://localhost:9000%';

UPDATE assets
SET preview_url = REPLACE(preview_url, 'http://127.0.0.1:9000', 'https://storage.electroai.shop')
WHERE preview_url LIKE 'http://127.0.0.1:9000%';
