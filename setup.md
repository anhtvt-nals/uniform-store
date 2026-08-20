# Setup CI/CD

## Hạ tầng

Ứng dụng gồm bốn tiến trình PM2: Storefront API (`3000`), Admin API (`3002`), Storefront (`3001`) và Admin (`5002`). Database dùng Supabase PostgreSQL; object storage dùng Cloudflare R2. Không triển khai Docker, PostgreSQL hay MinIO trên VPS.

## Chuẩn bị

1. Tạo Supabase project và sao chép Session pooler URI vào `DATABASE_URL`.
2. Tạo Cloudflare R2 bucket, API token có Object Read & Write, và public custom domain.
3. Điền các biến `DATABASE_URL`, `DB_SSL=true`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` trong `.env` tại root.

## VPS

```bash
git clone <repo-url> /opt/uniform-store
cd /opt/uniform-store
bash .github/scripts/setup-vps.sh yourdomain.com
```

Sau khi hoàn tất secrets, chạy migration:

```bash
cd /opt/uniform-store/backend
npm run migration:run
```

## CI/CD

Thêm `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, và tùy chọn `VPS_PORT` vào GitHub Actions secrets. Deploy thủ công:

```bash
cd /opt/uniform-store
bash .github/scripts/deploy.sh
```

## Vận hành

```bash
pm2 list
pm2 logs uniform-storefront-api
pm2 restart all
```
