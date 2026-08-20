# Deployment Guide

## Kiến trúc

```
VPS
├── PM2
│   ├── storefront-api :3000
│   ├── admin-api      :3002
│   ├── storefront     :3001
│   └── admin          :5002
└── Nginx :80/:443

Supabase PostgreSQL  ← DATABASE_URL
Cloudflare R2        ← R2_* credentials
```

Không cần Docker, PostgreSQL hay MinIO cục bộ trên VPS.

## Chuẩn bị dịch vụ quản lý

1. Trong Supabase, tạo project và lấy URI **Session pooler** cho `DATABASE_URL`. Dùng direct connection URI khi chạy migration từ máy có IPv6 hoặc đã bật IPv4 add-on.
2. Trong Cloudflare R2, tạo bucket `uniform-store`, API token có quyền Object Read & Write và public custom domain, ví dụ `https://assets.example.com`.
3. Điền `DATABASE_URL`, `DB_SSL=true`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, và `R2_PUBLIC_URL` trong `.env` tại root.

## VPS lần đầu

```bash
git clone <repo-url> /opt/uniform-store
cd /opt/uniform-store
bash .github/scripts/setup-vps.sh yourdomain.com
```

Trước khi start app, kiểm tra lại `.env`, sau đó chạy migration:

```bash
cd /opt/uniform-store/backend
npm run migration:run
```

## Triển khai cập nhật

```bash
cd /opt/uniform-store
bash .github/scripts/deploy.sh
```

## Lệnh hữu ích

```bash
pm2 list
pm2 logs uniform-storefront-api
pm2 restart all

cd /opt/uniform-store/backend
npm run migration:status
npm run migration:run
```
