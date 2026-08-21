import * as dotenv from 'dotenv';
import {readFile} from 'fs/promises';
import * as path from 'path';
import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';

dotenv.config({path: path.resolve(__dirname, '../../.env')});

type GalleryAsset = {
  source: string;
  key: string;
  alt: string;
};

const assets: GalleryAsset[] = [
  {source: 'garment-workers-1.jpg', key: 'production-gallery/cong-nhan-may-dong-phuc.jpg', alt: 'Công nhân may hoàn thiện đồng phục tại xưởng'},
  {source: 'cutting-room-1.jpg', key: 'production-gallery/cat-vai-dong-phuc.jpg', alt: 'Công đoạn cắt vải cho đơn hàng đồng phục'},
  {source: 'tailoring-shop-1.jpg', key: 'production-gallery/hoan-thien-dong-phuc.jpg', alt: 'Kiểm tra và hoàn thiện đồng phục may đo'},
  {source: 'fabric-rolls-1.jpg', key: 'production-gallery/kho-vai-dong-phuc.jpg', alt: 'Kho vải nguyên liệu dùng cho sản xuất đồng phục'},
  {source: 'textile-machine-1.jpg', key: 'production-gallery/may-cong-nghiep-dong-phuc.jpg', alt: 'Máy may công nghiệp trong xưởng sản xuất đồng phục'},
];

function getStorageConfig() {
  const endpoint = process.env.R2_ENDPOINT || (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '');
  const required = [
    ['R2 endpoint', endpoint],
    ['R2 access key', process.env.R2_ACCESS_KEY_ID],
    ['R2 secret key', process.env.R2_SECRET_ACCESS_KEY],
    ['R2 bucket', process.env.R2_BUCKET],
  ];
  const missing = required.filter(([, value]) => !value).map(([name]) => name);
  if (missing.length > 0) throw new Error(`Missing ${missing.join(', ')}.`);

  return {endpoint, bucket: process.env.R2_BUCKET!};
}

async function main() {
  const storage = getStorageConfig();
  const client = new S3Client({
    endpoint: storage.endpoint,
    region: process.env.R2_REGION || 'auto',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });
  const sourceDirectory = path.resolve(__dirname, '../../storefront/public/production');

  for (const asset of assets) {
    const body = await readFile(path.join(sourceDirectory, asset.source));
    await client.send(new PutObjectCommand({
      Bucket: storage.bucket,
      Key: asset.key,
      Body: body,
      ContentType: 'image/jpeg',
      CacheControl: 'public, max-age=31536000, immutable',
    }));
    console.log(`  ✓ ${asset.key} — ${asset.alt}`);
  }

  console.log(`✅ Uploaded ${assets.length} production gallery images to Cloudflare R2.`);
}

main().catch((error: Error) => {
  console.error('❌ Production gallery seed failed:', error.message);
  process.exit(1);
});
