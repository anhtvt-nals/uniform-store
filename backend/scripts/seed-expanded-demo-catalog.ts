import * as dotenv from 'dotenv';
import * as path from 'path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Client } from 'pg';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

type Text = Record<'vi' | 'en' | 'de', string>;
type ProductSeed = { slug: string; name: string; imageIds: [string, string] };
type CategorySeed = { slug: string; name: string; description: string; products: ProductSeed[] };

const text = (vi: string): Text => ({ vi, en: vi, de: vi });
const unsplashUrl = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;
const makeProducts = (prefix: string, names: string[], imageIds: string[]): ProductSeed[] => names.map((name, index) => ({
  slug: `${prefix}-${index + 1}`,
  name,
  imageIds: [imageIds[(index * 2) % imageIds.length], imageIds[(index * 2 + 1) % imageIds.length]],
}));

const categories: CategorySeed[] = [
  {
    slug: 'dong-phuc-cong-so', name: 'Đồng phục công sở', description: 'Thiết kế chỉn chu, đồng bộ hình ảnh thương hiệu cho đội ngũ văn phòng.',
    products: makeProducts('mau-cong-so', ['Sơ mi nữ cổ Đức', 'Sơ mi nam tay dài', 'Áo polo văn phòng', 'Áo gile công sở', 'Blazer nữ hiện đại', 'Vest nam doanh nghiệp', 'Đầm công sở lễ tân', 'Quần tây nữ công sở', 'Chân váy bút chì', 'Áo khoác đồng phục'], ['photo-1598032895397-b9472444bf93', 'photo-1617127365659-c47fa864d8bc', 'photo-1581044777550-4cfa60707c03', 'photo-1507679799987-c73779587ccf', 'photo-1551028719-00167b16eac5', 'photo-1473966968600-fa801b869a1a']),
  },
  {
    slug: 'dong-phuc-khach-san', name: 'Đồng phục khách sạn', description: 'Trang phục chuyên nghiệp cho lễ tân, buồng phòng và đội ngũ dịch vụ khách sạn.',
    products: makeProducts('mau-khach-san', ['Áo lễ tân nữ cổ vest', 'Áo lễ tân nam cao cấp', 'Đồng phục quản lý khách sạn', 'Đồng phục buồng phòng', 'Đồng phục phục vụ bàn', 'Đồng phục bếp trưởng', 'Tạp dề barista khách sạn', 'Đồng phục bellman', 'Đồng phục spa resort', 'Đồng phục an ninh khách sạn'], ['photo-1566665797739-1674de7a421a', 'photo-1610652492500-ded49ceeb378', 'photo-1581578731548-c64695cc6952', 'photo-1577219491135-ce391730fb2c', 'photo-1600891964092-4316c288032e', 'photo-1542314831-068cd1dbfeeb']),
  },
  {
    slug: 'dong-phuc-ao-polo', name: 'Đồng phục áo Polo', description: 'Áo polo đa dụng, thoải mái và dễ nhận diện cho đội ngũ bán hàng, sự kiện.',
    products: makeProducts('mau-polo', ['Polo pique doanh nghiệp', 'Polo cotton sự kiện', 'Polo phối viền cổ', 'Polo thể thao team building', 'Polo nhân viên bán hàng', 'Polo nhà hàng cafe', 'Polo golf cao cấp', 'Polo eco tái chế', 'Polo cổ zip hiện đại', 'Polo đồng phục kỹ thuật'], ['photo-1523381210434-271e8be1f52b', 'photo-1576566588028-4147f3842f27', 'photo-1598033129183-c4f50c736f10', 'photo-1517836357463-d25dfeac3438', 'photo-1529156069898-49953e39b3ac', 'photo-1618354691373-d851c5c3a990']),
  },
];

function randomPrice() { return Math.floor(200000 + Math.random() * 300001); }
function storageConfig() {
  const endpoint = process.env.R2_ENDPOINT || (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '');
  const required = [endpoint, process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY, process.env.R2_PUBLIC_URL, process.env.R2_BUCKET];
  if (required.some((value) => !value)) throw new Error('R2_ENDPOINT/R2 credentials/R2_PUBLIC_URL/R2_BUCKET are required.');
  return { endpoint, bucket: process.env.R2_BUCKET!, publicUrl: process.env.R2_PUBLIC_URL!.replace(/\/+$/, '') };
}

async function uploadImage(r2: S3Client, storage: ReturnType<typeof storageConfig>, categorySlug: string, productSlug: string, imageIndex: number, sourceId: string) {
  const source = await fetch(unsplashUrl(sourceId));
  if (!source.ok) throw new Error(`Cannot download ${productSlug} image ${imageIndex}: ${source.status}`);
  const buffer = Buffer.from(await source.arrayBuffer());
  const key = `seed-catalog/${categorySlug}/${productSlug}-${imageIndex + 1}.jpg`;
  await r2.send(new PutObjectCommand({ Bucket: storage.bucket, Key: key, Body: buffer, ContentType: source.headers.get('content-type') || 'image/jpeg', CacheControl: 'public, max-age=31536000, immutable' }));
  return { key, url: `${storage.publicUrl}/${key}`, size: buffer.length, mimeType: source.headers.get('content-type') || 'image/jpeg' };
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  const storage = storageConfig();
  const r2 = new S3Client({ endpoint: storage.endpoint, region: process.env.R2_REGION || 'auto', credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! }, forcePathStyle: true });
  const db = new Client({ connectionString: process.env.DATABASE_URL, ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined });
  await db.connect();
  try {
    // Existing catalog prices are randomized first; every matching variant gets the same real display price.
    await db.query(`UPDATE products SET base_price = FLOOR(200000 + random() * 300001)::BIGINT, updated_at = now() WHERE deleted_at IS NULL`);
    await db.query(`UPDATE product_variants v SET price = p.base_price, updated_at = now() FROM products p WHERE p.id = v.product_id AND p.deleted_at IS NULL AND v.deleted_at IS NULL`);

    let seeded = 0;
    for (const [categoryIndex, category] of categories.entries()) {
      const categoryResult = await db.query<{ id: string }>(`SELECT id FROM categories WHERE slug = $1 AND deleted_at IS NULL`, [category.slug]);
      if (!categoryResult.rows[0]) throw new Error(`Missing category: ${category.slug}. Run seed:demo-catalog first.`);
      const categoryId = categoryResult.rows[0].id;
      for (const [productIndex, product] of category.products.entries()) {
        // Upload both gallery images before changing product data.
        const uploads = await Promise.all(product.imageIds.map((sourceId, imageIndex) => uploadImage(r2, storage, category.slug, product.slug, imageIndex, sourceId)));
        const price = randomPrice();
        const name = text(product.name);
        const description = text(`${product.name} được may theo nhận diện thương hiệu, phù hợp đặt đồng phục số lượng lớn.`);
        const sku = `EXP-${categoryIndex + 1}-${String(productIndex + 1).padStart(2, '0')}`;
        await db.query('BEGIN');
        try {
          const productResult = await db.query<{ id: string }>(
            `INSERT INTO products (category_id, name, slug, description, sort_description, detail, sku, base_price, tax_rate, is_active, is_featured, weight, meta_title, meta_desc)
             VALUES ($1, $2, $3, $4, $4, $4, $5, $6, 0, true, false, 300, $2, $4)
             ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, name = EXCLUDED.name, description = EXCLUDED.description, sort_description = EXCLUDED.sort_description, detail = EXCLUDED.detail, sku = EXCLUDED.sku, base_price = EXCLUDED.base_price, is_active = true, deleted_at = NULL, updated_at = now()
             RETURNING id`, [categoryId, name, product.slug, description, sku, price],
          );
          const productId = productResult.rows[0].id;
          await db.query(`UPDATE product_variants SET price = $1, is_active = true, deleted_at = NULL, updated_at = now() WHERE product_id = $2`, [price, productId]);
          await db.query(`INSERT INTO product_variants (product_id, name, sku, barcode, price, tax_rate, weight, is_active, sort_order)
            SELECT $1, $2, $3, '', $4, 0, 300, true, 0 WHERE NOT EXISTS (SELECT 1 FROM product_variants WHERE product_id = $1 AND deleted_at IS NULL)`, [productId, name, `${sku}-STD`, price]);
          for (const [imageIndex, upload] of uploads.entries()) {
            const alt = { ...name, seed: 'expanded-demo-catalog', galleryIndex: imageIndex };
            const existing = await db.query<{ id: string }>(`SELECT id FROM product_images WHERE product_id = $1 AND alt @> $2::jsonb LIMIT 1`, [productId, JSON.stringify({ seed: 'expanded-demo-catalog', galleryIndex: imageIndex })]);
            if (existing.rows[0]) await db.query(`UPDATE product_images SET url = $1, alt = $2, sort_order = $3, deleted_at = NULL, updated_at = now() WHERE id = $4`, [upload.url, alt, imageIndex, existing.rows[0].id]);
            else await db.query(`INSERT INTO product_images (product_id, url, alt, sort_order) VALUES ($1, $2, $3, $4)`, [productId, upload.url, alt, imageIndex]);
            const asset = await db.query<{ id: string }>(`SELECT id FROM assets WHERE key = $1 LIMIT 1`, [upload.key]);
            if (asset.rows[0]) {
              await db.query(`UPDATE assets SET url = $1, filename = $2, mime_type = $3, size = $4, alt = $5, deleted_at = NULL WHERE id = $6`, [upload.url, path.basename(upload.key), upload.mimeType, upload.size, alt, asset.rows[0].id]);
            } else {
              await db.query(`INSERT INTO assets (url, key, filename, mime_type, size, alt) VALUES ($1, $2, $3, $4, $5, $6)`, [upload.url, upload.key, path.basename(upload.key), upload.mimeType, upload.size, alt]);
            }
          }
          await db.query('COMMIT');
          seeded += 1;
          console.log(`  ✓ ${product.slug} — ${price.toLocaleString('vi-VN')} VNĐ`);
        } catch (error) { await db.query('ROLLBACK'); throw error; }
      }
    }
    console.log(`✅ Randomized existing catalog prices and seeded ${seeded} products with 2 R2 gallery images each.`);
  } finally { await db.end(); }
}

main().catch((error: Error) => { console.error(`❌ Expanded demo catalog seed failed: ${error.message}`); process.exit(1); });
