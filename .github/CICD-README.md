# CI/CD Setup Guide

GitHub Actions kiểm tra TypeScript cho backend, storefront và admin. Deploy chạy trên VPS bằng Node.js, PM2 và Nginx; database là Supabase PostgreSQL, storage là Cloudflare R2.

## First-time setup

```bash
ssh root@YOUR_VPS_IP
git clone <repo-url> /opt/uniform-store
cd /opt/uniform-store
bash .github/scripts/setup-vps.sh yourdomain.com
```

Điền `DATABASE_URL` và các biến `R2_*` trong `.env` tại root, sau đó chạy `cd backend && npm run migration:run`.

## GitHub Secrets

| Secret | Value |
| --- | --- |
| `VPS_HOST` | VPS IP or hostname |
| `VPS_USER` | SSH user |
| `VPS_SSH_KEY` | SSH private key |
| `VPS_PORT` | Optional SSH port |

## Manual deploy

```bash
cd /opt/uniform-store
bash .github/scripts/deploy.sh
```
