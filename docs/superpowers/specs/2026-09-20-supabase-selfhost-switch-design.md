# Supabase self-host và chuyển đổi Cloud

## Mục tiêu

Chuẩn bị bộ script và tài liệu để dựng Supabase self-host trên VPS hiện tại, export PostgreSQL từ Supabase Cloud, restore sang self-host và chuyển ứng dụng qua lại giữa hai nguồn dữ liệu. Lần triển khai này chỉ tạo công cụ; không SSH, không chạy Docker, không export dữ liệu và không chỉnh production environment.

## Phạm vi

- PostgreSQL schema và dữ liệu ứng dụng.
- Docker Compose Supabase self-host theo bộ compose chính thức.
- Backup có checksum và kiểm tra trước restore.
- Quy trình switch/rollback cho bốn process PM2.
- Không migrate Supabase Auth hoặc Supabase Storage: ứng dụng dùng JWT riêng và Cloudflare R2.

## Thiết kế

### Script

- `scripts/supabase-selfhost-setup.sh`: kiểm tra quyền, Docker, dung lượng và port; tạo thư mục/config từ template; mặc định dry-run; chỉ tạo/chạy stack khi có `--apply`.
- `scripts/supabase-cloud-export.sh`: nhận `SOURCE_DATABASE_URL` từ environment hoặc file không commit; chạy `pg_dump` dạng custom format và ghi checksum; không ghi ngược Cloud.
- `scripts/supabase-selfhost-restore.sh`: kiểm tra file dump/checksum, kết nối target và yêu cầu `--confirm` trước khi restore.

Mọi script dùng `set -Eeuo pipefail`, không nhận secret qua command line, không dùng giá trị credential hard-code và dừng khi thiếu biến bắt buộc.

### Switch và rollback

Tài liệu switch sẽ yêu cầu backup cuối, maintenance window, dừng PM2, cập nhật `DATABASE_URL`/`DB_SSL`, chạy health check và migration status, rồi khởi động lại release. Rollback dùng lại Cloud URL đã backup nếu smoke test thất bại. Không tự động sửa `.env` production.

### An toàn dữ liệu

Restore không chạy nếu thiếu `--confirm`; file dump đặt ngoài Git và quyền file hạn chế. Script setup không tự mở firewall hoặc thay đổi Nginx. Các port cần thiết được kiểm tra và liệt kê để người vận hành duyệt.

## Kiểm thử

- Shell syntax check bằng `bash -n`.
- Dry-run trên máy không có secret để xác nhận guard rails.
- Kiểm tra script từ chối thiếu biến, thiếu backup, checksum sai và thiếu `--confirm`.
- Không test restore thật trong CI.
