import * as dotenv from 'dotenv';
import * as path from 'path';
import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {Client} from 'pg';

dotenv.config({path: path.resolve(__dirname, '../../.env')});

type DemoImage = {productId: string; slug: string; url: string; alt: Record<string, string>};
const fallbackImageUrl = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=85';

function getStorageConfig() {
  const endpoint = process.env.R2_ENDPOINT || (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '');
  const required = [
    ['R2 endpoint', endpoint],
    ['R2 access key', process.env.R2_ACCESS_KEY_ID],
    ['R2 secret key', process.env.R2_SECRET_ACCESS_KEY],
    ['R2 public URL', process.env.R2_PUBLIC_URL],
  ];
  const missing = required.filter(([, value]) => !value).map(([name]) => name);
  if (missing.length > 0) throw new Error(`Missing ${missing.join(', ')}.`);
  return {endpoint, publicUrl: process.env.R2_PUBLIC_URL!.replace(/\/+$/, ''), bucket: process.env.R2_BUCKET || 'uniform-store'};
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required to seed demo assets.');
  const storage = getStorageConfig();
  const db = new Client({connectionString: process.env.DATABASE_URL, ssl: process.env.DB_SSL === 'true' ? {rejectUnauthorized: false} : undefined});
  const r2 = new S3Client({
    endpoint: storage.endpoint,
    region: process.env.R2_REGION || 'auto',
    credentials: {accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!},
    forcePathStyle: true,
  });
  await db.connect();

  try {
    const {rows: images} = await db.query<DemoImage>(
      `SELECT p.id AS "productId", p.slug, pi.url, pi.alt
       FROM products p
       JOIN product_images pi ON pi.product_id = p.id
       WHERE p.deleted_at IS NULL
         AND pi.deleted_at IS NULL
         AND pi.alt @> '{"seed":"demo-catalog"}'::jsonb
         AND pi.url LIKE 'https://images.unsplash.com/%'
       ORDER BY p.slug`,
    );

    if (images.length === 0) {
      console.log('✅ Demo product images already point to R2, or run seed:demo-catalog first.');
      return;
    }

    for (const image of images) {
      let response = await fetch(image.url);
      if (!response.ok) {
        console.warn(`  ! ${image.slug}: source returned ${response.status}; using fallback image`);
        response = await fetch(fallbackImageUrl);
      }
      if (!response.ok) throw new Error(`Could not download ${image.slug}: ${response.status} ${response.statusText}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const key = `products/${image.productId}/demo-${image.slug}.jpg`;
      const publicUrl = `${storage.publicUrl}/${key}`;

      await r2.send(new PutObjectCommand({
        Bucket: storage.bucket,
        Key: key,
        Body: buffer,
        ContentType: response.headers.get('content-type') || 'image/jpeg',
      }));

      await db.query('BEGIN');
      try {
        const existing = await db.query<{id: string}>('SELECT id FROM assets WHERE key = $1 LIMIT 1', [key]);
        if (existing.rows[0]) {
          await db.query('UPDATE assets SET url = $1, filename = $2, mime_type = $3, size = $4, alt = $5, deleted_at = NULL WHERE id = $6', [publicUrl, `demo-${image.slug}.jpg`, response.headers.get('content-type') || 'image/jpeg', buffer.length, image.alt, existing.rows[0].id]);
        } else {
          await db.query('INSERT INTO assets (url, key, filename, mime_type, size, alt) VALUES ($1, $2, $3, $4, $5, $6)', [publicUrl, key, `demo-${image.slug}.jpg`, response.headers.get('content-type') || 'image/jpeg', buffer.length, image.alt]);
        }
        await db.query('UPDATE product_images SET url = $1, updated_at = now() WHERE product_id = $2 AND alt @> \'{"seed":"demo-catalog"}\'::jsonb', [publicUrl, image.productId]);
        await db.query('COMMIT');
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
      console.log(`  ✓ ${image.slug}`);
    }
    console.log(`✅ Uploaded and linked ${images.length} demo product images to R2.`);
  } finally {
    await db.end();
  }
}

main().catch((error: Error) => { console.error('❌ Demo asset seed failed:', error.message); process.exit(1); });
