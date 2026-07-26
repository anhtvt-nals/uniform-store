-- ══════════════════════════════════════════════════════════════
-- Migration: Convert Storage URLs to Keys
-- Strip scheme, host AND bucket prefix so only the S3 key remains.
-- StorageUrlInterceptor rebuilds the full URL from STORAGE_PUBLIC_URL at
-- response time, so the storage domain can change without a migration.
--
-- NOTE: this file never applied successfully — it originally targeted
-- customer_contracts.image_url and assets.preview_url, neither of which
-- exists. It also stripped only 'scheme://host/', which left the bucket
-- segment in place ('uniform-store/products/x.jpg'). Since
-- STORAGE_PUBLIC_URL already ends in '/uniform-store', that produced a
-- doubled bucket ('.../uniform-store/uniform-store/products/x.jpg') and
-- broke every image. The bucket is now stripped as well.
--
-- Stored form is 'http://<host>:9000/uniform-store/<key>'.
-- Target form is '<key>', e.g. 'products/<id>/<uuid>-<name>.jpg',
-- matching the values already present in assets.key.
--
-- The bucket group is optional and the pattern is anchored, so re-running
-- this migration over already-converted rows is a no-op.
-- ══════════════════════════════════════════════════════════════

-- Strip URLs from product_images.url
UPDATE product_images
SET url = REGEXP_REPLACE(url, '^https?://[^/]+/(uniform-store/)?', '')
WHERE url ~ '^https?://';

-- Strip URLs from categories.image_url
UPDATE categories
SET image_url = REGEXP_REPLACE(image_url, '^https?://[^/]+/(uniform-store/)?', '')
WHERE image_url ~ '^https?://';

-- Strip URLs from brands.logo_url
UPDATE brands
SET logo_url = REGEXP_REPLACE(logo_url, '^https?://[^/]+/(uniform-store/)?', '')
WHERE logo_url ~ '^https?://';

-- Strip URLs from customer_contracts (logo_url + contract_image_url)
UPDATE customer_contracts
SET logo_url = REGEXP_REPLACE(logo_url, '^https?://[^/]+/(uniform-store/)?', '')
WHERE logo_url ~ '^https?://';

UPDATE customer_contracts
SET contract_image_url = REGEXP_REPLACE(contract_image_url, '^https?://[^/]+/(uniform-store/)?', '')
WHERE contract_image_url ~ '^https?://';

-- Strip URLs from assets.url (table has url + key — there is no preview_url)
UPDATE assets
SET url = REGEXP_REPLACE(url, '^https?://[^/]+/(uniform-store/)?', '')
WHERE url ~ '^https?://';

-- Verify results (should show relative keys only)
-- SELECT url FROM product_images LIMIT 5;
-- Should see: "products/123/image.jpg" instead of
-- "https://storage.electroai.shop/uniform-store/products/123/image.jpg"
