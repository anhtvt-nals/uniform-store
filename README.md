# Minh An Uniform Store

Monorepo thương mại điện tử gồm storefront Next.js, admin Next.js và hai NestJS API. Dự án chạy trực tiếp bằng Node.js; không dùng Docker.

## Hạ tầng quản lý

- **Database:** Supabase PostgreSQL, kết nối qua `DATABASE_URL`.
- **Object storage:** Cloudflare R2, truy cập qua S3 API và public custom domain.
- **Ứng dụng:** Node.js 22+; chạy local với npm workspaces hoặc production với PM2.

## Cấu hình

1. Sao chép `.env.example` thành `.env` và điền Supabase/R2 credentials.
2. Đặt `NEXT_PUBLIC_STORAGE_URL` trong `storefront/.env.local` và `admin/.env.local` bằng cùng giá trị `R2_PUBLIC_URL` nếu ảnh được render bởi Next.js.

`DATABASE_URL` nên là URI **Session pooler** của Supabase cho API Node.js chạy lâu dài. Để chạy migration hoặc backup, dùng URI direct connection do Supabase cung cấp. Backend và migration runner đều đọc file `.env` tại root.

## Phát triển

```bash
npm install
npm run dev
```

Hoặc chạy từng ứng dụng:

```bash
npm run dev:backend
npm run dev:storefront
npm run dev:admin
```

Chạy migration:

```bash
cd backend
npm run migration:run
```

## Build production

```bash
npm run build
npm run start
```

Xem [DEPLOY.md](DEPLOY.md) để triển khai bằng PM2 và Nginx.
