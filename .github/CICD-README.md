# CI/CD Setup Guide

## Architecture

```
GitHub Push → main
    ↓
GitHub Actions CI (ubuntu-latest)
    ├── Lint & Type Check (backend, storefront, admin)
    └── Backend Tests (PostgreSQL service)
    ↓ (success)
GitHub Actions CD
    └── SSH → VPS → deploy.sh
         ├── git pull
         ├── npm ci --workspaces
         ├── nest build (backend)
         ├── next build (storefront + admin)
         ├── migration:run
         └── pm2 restart all
```

## VPS Stack

| Component | Tech | Port |
|-----------|------|------|
| PostgreSQL | Docker | 127.0.0.1:5432 |
| MinIO | Docker | 127.0.0.1:9000 |
| Storefront API | PM2 (Node.js) | 127.0.0.1:3000 |
| Admin API | PM2 (Node.js) | 127.0.0.1:3002 |
| Storefront UI | PM2 (Next.js) | 127.0.0.1:3001 |
| Admin UI | PM2 (Next.js) | 127.0.0.1:5002 |
| Nginx | System | 80, 443 |

## First-Time VPS Setup

```bash
# 1. SSH into VPS
ssh root@YOUR_VPS_IP

# 2. Clone repo
git clone <repo-url> /opt/uniform-store
cd /opt/uniform-store

# 3. Run setup
bash .github/scripts/setup-vps.sh yourdomain.com

# 4. Edit secrets
nano /opt/uniform-store/.env

# 5. DNS
#    A: yourdomain.com → VPS_IP
#    A: admin.yourdomain.com → VPS_IP

# 6. SSL
certbot --nginx -d yourdomain.com -d admin.yourdomain.com
```

## GitHub Secrets

| Secret | Value |
|--------|-------|
| `VPS_HOST` | VPS IP |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | SSH private key |
| `VPS_PORT` | `22` (optional) |

## Manual Deploy

```bash
ssh root@VPS_IP
cd /opt/uniform-store
bash .github/scripts/deploy.sh
```

## Useful Commands

```bash
# Check status
pm2 list
docker compose -f docker-compose.infra.yml ps

# Logs
pm2 logs uniform-storefront-api
pm2 logs uniform-admin-api

# Restart
pm2 restart uniform-storefront-api

# Migration
cd backend && npm run migration:run
cd backend && npm run migration:status
```

## Files

```
.github/
├── workflows/
│   ├── ci.yml              # CI: lint + test
│   └── deploy.yml          # CD: SSH → deploy.sh
├── scripts/
│   ├── setup-vps.sh        # One-time VPS setup
│   └── deploy.sh           # Deploy script
└── CICD-README.md          # This file

docker-compose.infra.yml    # PostgreSQL + MinIO only
.env.example                # Env template
```
