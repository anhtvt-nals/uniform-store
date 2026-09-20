# Supabase self-host: setup và migrate database

Tài liệu này chỉ chuyển **PostgreSQL database** từ Supabase Cloud sang PostgreSQL trong Supabase self-host. Auth, Storage và Edge Functions không nằm trong phạm vi.

## 1. Chuẩn bị

- VPS Ubuntu/Debian có quyền `sudo` hoặc `root`.
- DNS/firewall và backup VPS đã được chuẩn bị.
- Có hai connection string PostgreSQL:
  - `SOURCE_DATABASE_URL`: database Supabase Cloud.
  - `TARGET_DATABASE_URL`: database PostgreSQL của self-host.
- Cài `git`, `docker compose`, `python3`, `postgresql-client` (`pg_dump`, `pg_restore`). Script cài self-host sẽ cài Docker nếu chạy trên Ubuntu/Debian.

Không ghi connection string hoặc password vào Git, shell history, `DEPLOY.md` hay tài liệu này.

## 2. Cài bộ Supabase self-host

Chạy dry-run trước:

```bash
INSTALL_DIR=/opt/supabase scripts/install-supabase-self-host.sh
```

Sau khi kiểm tra đúng VPS và thư mục đích, cài file Compose. Mặc định script khởi động database và dashboard (`db`, `meta`, `studio`), các module khác không chạy:

```bash
sudo INSTALL_DIR=/opt/supabase scripts/install-supabase-self-host.sh --apply
```

Script không tự khởi động service nếu không có `--start`. Sau khi chỉnh `.env` của Supabase self-host:

```bash
cd /opt/supabase
sudo docker compose up -d --wait db meta studio
sudo docker compose ps
```

Chỉ dùng `--start` khi đã review `.env`:

```bash
sudo INSTALL_DIR=/opt/supabase scripts/install-supabase-self-host.sh --apply --start
```

Nếu chỉ cần database, dùng `--database-only`:

```bash
sudo INSTALL_DIR=/opt/supabase scripts/install-supabase-self-host.sh --apply --start --database-only
```

Nếu cần toàn bộ Supabase (Auth, REST, Realtime, Storage, Studio...), dùng thêm `--full`:

```bash
sudo INSTALL_DIR=/opt/supabase scripts/install-supabase-self-host.sh --apply --start --full
```

## 3.1 Expose Studio với Basic Auth

Studio mặc định không publish port ra host. Tạo file `/opt/supabase/docker-compose.override.yml`:

```yaml
services:
  studio:
    ports:
      - "127.0.0.1:3001:3000"
```

Khởi động lại:

```bash
cd /opt/supabase
sudo docker compose up -d db meta studio
```

Cài Nginx và công cụ tạo password:

```bash
sudo apt-get install -y nginx apache2-utils
sudo htpasswd -c /etc/nginx/.supabase-studio.htpasswd admin
```

Tạo server block `/etc/nginx/sites-available/supabase-studio`:

```nginx
server {
    listen 7000 default_server;
    server_name _;

    location / {
        auth_basic "Supabase Studio";
        auth_basic_user_file /etc/nginx/.supabase-studio.htpasswd;
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Kích hoạt cấu hình:

```bash
sudo ln -s /etc/nginx/sites-available/supabase-studio /etc/nginx/sites-enabled/supabase-studio
sudo nginx -t
sudo systemctl reload nginx
```

Mở port `7000` trên firewall và truy cập bằng:

```text
http://YOUR_VPS_IP:7000
```

Không mở port `3001` ra Internet; chỉ Nginx được truy cập Studio. Cấu hình này không dùng domain hoặc HTTPS, phù hợp cho truy cập nội bộ/VPN. Nếu public Internet, nên bổ sung HTTPS và giới hạn IP truy cập.

## 3. Kiểm tra database đích

Lấy connection string PostgreSQL nội bộ của self-host, không dùng URL REST/API. Xác nhận database đích trống hoặc đã có backup; lệnh restore bên dưới dùng `--clean --if-exists`.

## 4. Migrate database

Chạy từ máy có thể kết nối tới cả hai database:

```bash
SOURCE_DATABASE_URL='postgresql://cloud_user:cloud_password@cloud-host:5432/postgres' \
TARGET_DATABASE_URL='postgresql://selfhost_user:selfhost_password@selfhost-host:5432/postgres' \
BACKUP_DIR=/var/backups/supabase \
scripts/migrate-supabase-cloud-db.sh --confirm
```

Script sẽ:

1. Tạo dump dạng custom bằng `pg_dump`.
2. Restore schema và dữ liệu bằng `pg_restore`.
3. Tạm lưu dump ngoài repository và tự xóa khi kết thúc.

`--confirm` là bắt buộc vì dữ liệu trong database đích có thể bị ghi đè. Không chạy script này đồng thời với traffic ghi dữ liệu; nên đặt ứng dụng ở maintenance/read-only trong lúc migrate.

## 5. Kiểm tra sau migrate

```bash
psql "$TARGET_DATABASE_URL" -c '\dt'
psql "$TARGET_DATABASE_URL" -c 'select count(*) from public.products;'
```

Kiểm tra thêm một bản ghi ở các bảng chính, đăng nhập admin, đọc sản phẩm và tạo một đơn thử nghiệm trên môi trường staging.

## 6. Switch ứng dụng

1. Cập nhật `DATABASE_URL` của backend sang `TARGET_DATABASE_URL` trong secret manager hoặc file environment trên VPS.
2. Restart backend và kiểm tra health endpoint/log.
3. Smoke test storefront, admin, đăng nhập, sản phẩm và checkout.
4. Giữ Supabase Cloud ở chế độ không ghi trong thời gian xác nhận.

Rollback là đổi `DATABASE_URL` về connection string Cloud rồi restart backend. Không xóa database Cloud cho tới khi hoàn tất thời gian theo dõi và có backup self-host hợp lệ.

## 7. Kiểm tra script cục bộ

```bash
scripts/supabase-db-scripts-check.sh
```

Không chạy `--apply`, `--start` hoặc `--confirm` trong môi trường production nếu chưa kiểm tra connection string và backup.
