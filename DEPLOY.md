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
git clone <repo-url> "$HOME/uniform-store"
cd "$HOME/uniform-store"
bash .github/scripts/setup-vps.sh yourdomain.com ops@yourdomain.com
```

Lần chạy đầu tạo `.env` rồi dừng. Điền secrets, đặt `NODE_ENV=production`, sau đó chạy lại đúng lệnh trên. Script tự chạy migration, build, cấp SSL và start PM2.

Chạy setup bằng user `ubuntu` có quyền `sudo`; PM2 và ứng dụng sẽ chạy dưới user này. Nếu trước đó bạn đã chạy setup bằng root, script sẽ dừng PM2 của root và chuyển quyền thư mục project sang `ubuntu`.

Nếu dùng GitHub Actions, dùng các secrets: `VPS_USER=ubuntu` và `VPS_APP_DIR=/home/ubuntu/uniform-store`.

```bash
cd "$HOME/uniform-store/backend"
npm run migration:status
```

## Triển khai cập nhật

```bash
cd "$HOME/uniform-store"
bash .github/scripts/deploy.sh
```

## Lệnh hữu ích

```bash
pm2 list
pm2 logs uniform-storefront-api
pm2 restart all

cd "$HOME/uniform-store/backend"
npm run migration:status
npm run migration:run
```
