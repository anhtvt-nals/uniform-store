# 🚀 Deployment & CI/CD Guide

## Overview

```
┌─────────────────────────────────────────────────────┐
│                    GitHub                            │
│  git push → main                                    │
│      ↓                                              │
│  GitHub Actions CI                                  │
│  ├── Lint + Type Check (3 workspaces)               │
│  └── Backend Tests (PostgreSQL container)           │
│      ↓ success                                      │
│  GitHub Actions CD                                  │
│  └── SSH → VPS → deploy.sh                          │
│      ├── git pull                                   │
│      ├── npm ci --workspaces                        │
│      ├── nest build (storefront-api, admin-api)     │
│      ├── next build (storefront, admin)             │
│      ├── migration:run                              │
│      └── pm2 restart all                            │
└─────────────────────────────────────────────────────┘
```

## Architecture

```
VPS (Ubuntu 22.04/24.04)
├── Docker (chỉ cho DB + Storage)
│   ├── PostgreSQL 16     → 127.0.0.1:5432
│   └── MinIO            → 127.0.0.1:9000
│
├── PM2 (cho apps)
│   ├── storefront-api    → 127.0.0.1:3000  (NestJS)
│   ├── admin-api         → 127.0.0.1:3002  (NestJS)
│   ├── storefront        → 127.0.0.1:3001  (Next.js)
│   └── admin             → 127.0.0.1:5002  (Next.js)
│
└── Nginx                 → 80, 443
    ├── yourdomain.com         → storefront:3001
    ├── admin.yourdomain.com   → admin:5002 + admin-api:3002
    └── storage.yourdomain.com → MinIO:9000
```

---

## 1. VPS Setup (lần đầu)

### Yêu cầu
- Ubuntu 22.04 hoặc 24.04
- Tối thiểu 1GB RAM, 1 vCPU
- Domain đã trỏ DNS đến VPS IP

### Bước 1: SSH vào VPS

```bash
ssh root@YOUR_VPS_IP
```

### Bước 2: Clone repo

```bash
git clone <your-github-repo-url> /opt/uniform-store
cd /opt/uniform-store
```

### Bước 3: Chạy setup script

```bash
bash .github/scripts/setup-vps.sh yourdomain.com
```

Script sẽ tự động:
- Cài Node.js 22, PM2, Docker, Nginx
- Khởi động PostgreSQL + MinIO (Docker)
- Cài dependencies + Build apps
- Start apps bằng PM2
- Config Nginx reverse proxy
- Tạo SSL self-signed (tạm thời)

### Bước 4: Cấu hình .env

```bash
nano /opt/uniform-store/.env
```

Điền các giá trị quan trọng:
```bash
# Database password
DB_PASSWORD=your-strong-password

# JWT secret (generate with: openssl rand -hex 32)
JWT_SECRET=your-random-secret

# MinIO credentials
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
STORAGE_PUBLIC_URL=https://storage.yourdomain.com
```

### Bước 5: DNS

Tại nhà cung cấp domain, tạo A Records:

| Host | Value |
|------|-------|
| `@` | `YOUR_VPS_IP` |
| `www` | `YOUR_VPS_IP` |
| `admin` | `YOUR_VPS_IP` |
| `storage` | `YOUR_VPS_IP` |

### Bước 6: SSL Certificate

```bash
# Chờ DNS propagete (5-10 phút)
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d admin.yourdomain.com
```

### Bước 7: Chạy migrations

```bash
cd /opt/uniform-store/backend
npm run migration:run
```

---

## 2. GitHub Setup

### Bước 1: Thêm GitHub Secrets

GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Giá trị | Mô tả |
|--------|---------|-------|
| `VPS_HOST` | `123.45.67.89` | IP hoặc hostname VPS |
| `VPS_USER` | `root` | SSH username |
| `VPS_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | SSH private key (toàn bộ) |
| `VPS_PORT` | `22` | SSH port (optional) |

> **Tạo SSH key cho deploy:**
> ```bash
> # Trên máy local
> ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy -N ""
> cat ~/.ssh/github_deploy.pub
> # → Copy public key vào VPS: /root/.ssh/authorized_keys
> cat ~/.ssh/github_deploy
> # → Copy private key vào GitHub Secret VPS_SSH_KEY
> ```

### Bước 2: Push code

```bash
git add .
git commit -m "feat: your changes"
git push origin main
```

CI/CD sẽ tự động chạy!

---

## 3. Manual Deploy

Nếu không muốn auto-deploy, có thể deploy thủ công:

```bash
ssh root@YOUR_VPS_IP
cd /opt/uniform-store
bash .github/scripts/deploy.sh
```

Hoặc từng bước:

```bash
cd /opt/uniform-store

# Pull latest
git pull origin main

# Install deps
npm ci --workspaces

# Build backend
cd backend && npx nest build storefront-api && npx nest build admin-api && cd ..

# Build frontend
cd storefront && npm run build && cd ..
cd admin && npm run build && cd ..

# Run migrations
cd backend && npm run migration:run && cd ..

# Restart apps
pm2 restart all
```

---

## 4. Useful Commands

### PM2 (quản lý apps)

```bash
pm2 list                    # Xem tất cả apps
pm2 logs                    # Xem logs tất cả
pm2 logs uniform-storefront-api   # Logs 1 app cụ thể
pm2 restart all             # Restart tất cả
pm2 restart uniform-admin-api     # Restart 1 app
pm2 stop uniform-admin-api        # Stop 1 app
pm2 monit                   # Monitor realtime
```

### Docker (DB + Storage)

```bash
docker compose -f docker-compose.infra.yml ps          # Trạng thái
docker compose -f docker-compose.infra.yml logs postgres  # Logs
docker compose -f docker-compose.infra.yml restart postgres # Restart
docker compose -f docker-compose.infra.yml down        # Dừng tất cả
docker compose -f docker-compose.infra.yml up -d       # Khởi động
```

### Database Migrations

```bash
cd /opt/uniform-store/backend
npm run migration:status    # Xem trạng thái migrations
npm run migration:run       # Chạy migration chưa apply
```

### Nginx

```bash
nginx -t                    # Test config
systemctl reload nginx      # Reload config
systemctl restart nginx     # Restart
cat /var/log/nginx/error.log   # Xem lỗi
```

### Debug

```bash
# Kiểm tra ports đang mở
ss -tlnp

# Kiểm tra processes
pm2 list
docker ps

# Xem disk usage
df -h

# Xem memory
free -m
```

---

## 5. Troubleshooting

### Lỗi: "Cannot find module '@app/database'"

```bash
cd /opt/uniform-store/backend
rm -rf node_modules/.cache
npm ci
npx nest build storefront-api
npx nest build admin-api
pm2 restart all
```

### Lỗi: Migration "relation already exists"

```bash
cd /opt/uniform-store/backend
npm run migration:status    # Kiểm tra migration nào đã chạy
# Nếu DB đã có schema, đánh dấu tất cả là applied:
node scripts/seed-migrations.js
```

### Lỗi: "Port already in use"

```bash
# Tìm process đang dùng port
lsof -i :3001
lsof -i :3002

# Kill process
kill -9 <PID>
```

### Lỗi: Nginx 502 Bad Gateway

```bash
# Kiểm tra apps có đang chạy không
pm2 list

# Nếu app crash, xem logs
pm2 logs uniform-storefront-api --lines 50

# Restart
pm2 restart uniform-storefront-api
```

### Reset PM2

```bash
pm2 kill                    # Dừng tất cả
pm2 save                    # Save config
pm2 startup                 # Setup auto-start
```

---

## 6. File Reference

```
.github/
├── workflows/
│   ├── ci.yml              # CI: lint + test
│   └── deploy.yml          # CD: SSH → deploy.sh
├── scripts/
│   ├── setup-vps.sh        # Setup lần đầu VPS
│   └── deploy.sh           # Deploy script
└── CICD-README.md          # Quick reference

docker-compose.infra.yml    # PostgreSQL + MinIO
.env.example                # Env vars template
DEPLOY.md                   # File này
```
