# Setup CI/CD — Hướng dẫn từ đầu

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Kiến trúc CI/CD](#2-kiến-trúc-cicd)
3. [Cấu hình GitHub Secrets](#3-cấu-hình-github-secrets)
4. [Setup VPS lần đầu](#4-setup-vps-lần-đầu)
5. [Kiểm tra CI/CD hoạt động](#5-kiểm-tra-cicd-hoạt-động)
6. [Triển khai thủ công](#6-triển-khai-thủ-công)
7. [Lệnh PM2 thường dùng](#7-lệnh-pm2-thường-dùng)
8. [Xử lý sự cố](#8-xử-lý-sự-cố)

---

## 1. Tổng quan

Dự án gồm **4 service** chạy trên VPS qua **PM2**:

| Service | Framework | Port | PM2 name |
|---------|-----------|------|----------|
| Storefront API | NestJS | 3000 | `uniform-storefront-api` |
| Admin API | NestJS | 3002 | `uniform-admin-api` |
| Storefront UI | Next.js | 3001 | `uniform-storefront` |
| Admin UI | Next.js | 5002 | `uniform-admin` |

Cơ sở dữ liệu (PostgreSQL) và object storage (MinIO) chạy trong Docker.

---

## 2. Kiến trúc CI/CD

```
Push → main (hoặc PR vào main)
    │
    ▼
┌──────────────────────┐
│  CI (GitHub Actions) │
│  ├── lint 3 jobs     │  ← backend / storefront / admin: tsc --noEmit
│  └── test-backend    │  ← jest với PostgreSQL container
└──────┬───────────────┘
       │ success
       ▼
┌──────────────────────┐
│  CD (GitHub Actions) │
│  └── SSH → VPS       │
│      ├── git pull     │
│      ├── npm ci       │
│      ├── nest build   │
│      ├── next build   │
│      ├── migration    │
│      └── pm2 restart  │
└──────────────────────┘
```

CI chạy trên **push/PR vào main**. Nếu CI success, CD tự động deploy lên VPS.

---

## 3. Cấu hình GitHub Secrets

Vào GitHub repo → **Settings → Secrets and variables → Actions** → thêm:

| Secret | Giá trị | Ví dụ |
|--------|---------|-------|
| `VPS_HOST` | Địa chỉ IP VPS | `123.123.123.123` |
| `VPS_USER` | User SSH | `root` |
| `VPS_SSH_KEY` | **Private key SSH** (cả dòng) | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |
| `VPS_PORT` | Cổng SSH | `22` (mặc định) |

> **Lưu ý:** `VPS_SSH_KEY` phải là private key tương ứng với public key đã copy lên VPS.

### Tạo SSH key (chạy trên laptop/máy local, KHÔNG phải trên VPS):

```bash
# 1. Tạo cặp key mới trên máy local
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions

# 2. Copy PUBLIC key lên VPS
ssh-copy-id -i ~/.ssh/github-actions.pub root@VPS_IP

# 3. Lấy PRIVATE key để paste vào GitHub Secrets
cat ~/.ssh/github-actions
```

> ⚠️ **Bảo mật:** Private key (`~/.ssh/github-actions`) chỉ lưu trên máy local + GitHub Secrets, **không bao giờ** copy lên VPS. Public key (`.pub`) thì được copy lên VPS.

---

## 4. Setup VPS lần đầu

### Bước 1: SSH vào VPS

```bash
ssh root@VPS_IP
```

### Bước 2: Cài đặt Git và clone repo

```bash
apt update && apt install -y git
git clone <repo-url> /opt/uniform-store
cd /opt/uniform-store
```

### Bước 3: Chạy script setup VPS

Script này tự động:
- Cài Node.js 22, PM2, Docker, Nginx, UFW
- Tạo file `.env` với JWT_SECRET tự sinh
- Khởi động PostgreSQL + MinIO qua Docker Compose
- Build toàn bộ project
- Start 4 service qua PM2
- Tạo cấu hình Nginx

> ⚠️ **Quan trọng — đặt mật khẩu DB trước khi chạy script:** `docker-compose.infra.yml` chỉ áp dụng `POSTGRES_PASSWORD` khi Postgres khởi tạo volume dữ liệu **lần đầu tiên**. Nếu bạn để mặc định rồi sửa `DB_PASSWORD` trong `.env` sau đó, container Postgres đang chạy **sẽ không đổi mật khẩu** (mật khẩu thật vẫn là giá trị lúc khởi tạo). Vì vậy hãy truyền `DB_PASSWORD` (và `MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY` nếu muốn) ngay khi chạy script lần đầu:

```bash
DB_PASSWORD='your-strong-password' bash .github/scripts/setup-vps.sh yourdomain.com
```

> Thay `yourdomain.com` bằng domain thật (hoặc IP nếu chưa có domain).

Nếu đã lỡ chạy script với mật khẩu mặc định, đổi mật khẩu Postgres thủ công thay vì chỉ sửa `.env`:
```bash
docker exec -it uniform-postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'your-strong-password';"
# rồi mới cập nhật DB_PASSWORD trong .env cho khớp
```

### Bước 4: Điền biến môi trường

Sau khi script chạy xong, mở file `.env` để điền các giá trị thật:

```bash
nano /opt/uniform-store/.env
```

`JWT_SECRET` đã được tự động sinh (giữ nguyên là được). Các biến còn lại tuỳ nhu cầu:
- `DB_PASSWORD` — nếu chưa đặt ở Bước 3, đổi theo hướng dẫn ALTER USER ở trên (sửa trực tiếp trong `.env` không có tác dụng với container đã khởi tạo)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — **tuỳ chọn**, chỉ cần nếu dùng Supabase
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SALES_EMAIL`, `MAIL_FROM` — **tuỳ chọn**, backend có giá trị mặc định (`noreply@minhanuniform.vn`, `sales@minhanuniform.vn`) nếu bỏ trống thì tính năng gửi email sẽ không hoạt động nhưng app vẫn chạy bình thường. Các biến này chưa có sẵn trong template `.env` do script tạo ra, cần tự thêm nếu cần dùng.

Sau đó chạy lại deploy để build với env mới:
```bash
bash .github/scripts/deploy.sh
```

### Bước 5: Trỏ DNS

```
A record:  yourdomain.com → VPS_IP
A record:  admin.yourdomain.com → VPS_IP
```

### Bước 6: Cài SSL (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d admin.yourdomain.com
```

---

## 5. Kiểm tra CI/CD hoạt động

### Kiểm tra CI

1. Tạo PR vào nhánh `main` — GitHub Actions sẽ chạy workflow **CI**.
2. Vào GitHub → **Actions** tab → kiểm tra **CI** workflow chạy xanh.
3. Các job:
   - `Lint & Type Check (backend)` — `tsc --noEmit`
   - `Lint & Type Check (storefront)` — `tsc --noEmit`
   - `Lint & Type Check (admin)` — `tsc --noEmit`
   - `Backend Tests` — `jest` với PostgreSQL container

> ⚠️ **Đã sửa lỗi:** trước đây các step này chạy với `|| true` nên **luôn báo thành công** dù `tsc`/`jest` thật sự lỗi — CI xanh giả, code lỗi vẫn được CD tự động deploy lên VPS. Đã bỏ `|| true` trong `.github/workflows/ci.yml`, giờ CI sẽ fail đúng khi có lỗi type-check hoặc test, và CD sẽ không chạy nếu CI fail.

### Kiểm tra CD

1. Merge PR vào `main`.
2. CI chạy lại trên push → success → CD tự động trigger.
3. Vào GitHub Actions → kiểm tra **Deploy to VPS** workflow.
4. Nếu xanh → đã deploy thành công.

### Sau khi deploy

```bash
# Kiểm tra các service
pm2 list

# Kiểm tra log
pm2 logs uniform-storefront-api --lines 20

# Kiểm tra health
curl http://localhost:3000/health
curl http://localhost:3002/health
```

---

## 6. Triển khai thủ công

Dùng khi cần deploy nhanh không qua GitHub Actions:

```bash
ssh root@VPS_IP
cd /opt/uniform-store
bash .github/scripts/deploy.sh
```

Hoặc deploy từng bước:

```bash
cd /opt/uniform-store
git pull origin main
npm ci --workspaces

# Build backend
cd backend && npx nest build storefront-api && npx nest build admin-api && cd ..

# Build storefront
cd storefront && npm run build && cd ..

# Build admin
cd admin && npm run build && cd ..

# Migration
cd backend && npx tsx scripts/run-migrations.ts run && cd ..

# Restart
pm2 restart all
pm2 save
```

---

## 7. Lệnh PM2 thường dùng

```bash
pm2 list                          # Danh sách service
pm2 logs                          # Log tất cả
pm2 logs uniform-storefront-api   # Log 1 service
pm2 monit                         # Dashboard real-time
pm2 restart uniform-admin         # Restart 1 service
pm2 restart all                   # Restart tất cả
pm2 stop all                      # Dừng tất cả
pm2 save                          # Lưu cấu hình (tự động start sau reboot)
pm2 startup                       # Tạo systemd autorun
```

---

## 8. Xử lý sự cố

### CI không chạy?

- Kiểm tra **Actions** tab có bị **disable** không (Settings → Actions → Allow all actions).
- Kiểm tra branch có đúng `main` không.
- Push commit mới để trigger lại.

### Deploy không tự động?

- Kiểm tra CI có **success** không (CD chỉ chạy khi CI success trên `main`).
- Kiểm tra **GitHub Secrets** đã đúng chưa.
- Vô hiệu hoá **require approval** nếu dùng environment protection.

### SSH từ GitHub Actions không được?

- Kiểm tra public key đã được copy lên VPS:
  ```bash
  ssh root@VPS_IP "cat ~/.ssh/authorized_keys"
  ```
- Kiểm tra private key trong **GitHub Secrets** (`VPS_SSH_KEY`) không có ký tự thừa.

### Build thất bại?

- Chạy thủ công trên VPS để xem lỗi chi tiết:
  ```bash
  cd /opt/uniform-store
  bash .github/scripts/deploy.sh
  ```

### Migration lỗi?

```bash
cd /opt/uniform-store/backend
npx tsx scripts/run-migrations.ts status  # Kiểm tra trạng thái
npx tsx scripts/run-migrations.ts run     # Chạy migration
```

### Cần rollback?

```bash
cd /opt/uniform-store
git checkout <commit-hash> -- .
bash .github/scripts/deploy.sh
```

---

## File tham chiếu

```
.github/
├── workflows/
│   ├── ci.yml                  # CI workflow
│   └── deploy.yml              # CD workflow
├── scripts/
│   ├── setup-vps.sh            # Script setup VPS lần đầu (238 dòng)
│   └── deploy.sh               # Script deploy (77 dòng)
├── CICD-README.md              # Tóm tắt CI/CD

docker-compose.infra.yml        # PostgreSQL + MinIO (production)
docker-compose.yml              # Full stack (dev)
.env.example                    # Mẫu biến môi trường
DEPLOY.md                       # Hướng dẫn deploy chi tiết
setup.md                        # File này
```
