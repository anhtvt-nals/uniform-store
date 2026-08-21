import * as dotenv from 'dotenv';
import {readFile} from 'fs/promises';
import * as path from 'path';
import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';

dotenv.config({path: path.resolve(__dirname, '../../.env')});

type GalleryAsset = {
  key: string;
  alt: string;
  source: string;
};

const assets: GalleryAsset[] = [
  {
    key: 'production-gallery/thiet-ke-cat-rap-dong-phuc.jpg',
    alt: 'Thợ vận hành máy cắt rập cho mẫu đồng phục',
    source: '3537847f-f0f7-42d8-a7dd-79681a8f6546.jpeg',
  },
  {
    key: 'production-gallery/cat-vai-dong-phuc.jpg',
    alt: 'Công đoạn may chi tiết đồng phục',
    source: '31e4b09b-31c0-4772-a70a-1eac6f7f6d79.jpeg',
  },
  {
    key: 'production-gallery/day-chuyen-may-dong-phuc-01.jpg',
    alt: 'Dây chuyền may đồng phục tại xưởng',
    source: '1e0cef08-3abb-41e4-b8f5-f1d9b933e5a3.jpeg',
  },
  {
    key: 'production-gallery/day-chuyen-may-dong-phuc-02.jpg',
    alt: 'Công nhân vận hành dây chuyền may công nghiệp',
    source: 'fb00c6f0-e617-487c-8706-8c16ec7e226b.jpeg',
  },
  {
    key: 'production-gallery/hoan-thien-dong-phuc.jpg',
    alt: 'Hoàn thiện và kiểm tra chất lượng đồng phục',
    source: 'ac66e149-e190-4bca-8125-eebf5fe81244.jpeg',
  },
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
  const sourceDirectory = path.resolve(__dirname, '../assets');
  for (const asset of assets) {
    const body = await readFile(path.join(sourceDirectory, asset.source));
    await client.send(new PutObjectCommand({
      Bucket: storage.bucket,
      Key: asset.key,
      Body: body,
      ContentType: 'image/jpeg',
      CacheControl: 'public, max-age=31536000, immutable',
      Metadata: {source: `backend/assets/${asset.source}`},
    }));
    console.log(`  ✓ ${asset.key} — ${asset.alt}`);
  }

  console.log(`✅ Uploaded ${assets.length} production gallery images to Cloudflare R2.`);
}

main().catch((error: Error) => {
  console.error('❌ Production gallery seed failed:', error.message);
  process.exit(1);
});
