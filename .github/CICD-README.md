# Production deploy with VPS, PM2 and Nginx

Production traffic flows as follows:

```text
Internet → Nginx (HTTPS)
         ├─ yourdomain.com       → Storefront Next.js :3001
         └─ admin.yourdomain.com → Admin Next.js :5002 and Admin API :3002

Storefront Next.js → Storefront API :3000 (private loopback)
Storefront/Admin APIs → Supabase PostgreSQL and Cloudflare R2
```

## 1. DNS and VPS prerequisites

Before setup, create DNS `A` records for both hosts and wait for them to resolve to the VPS IP:

```text
yourdomain.com        → VPS_IP
admin.yourdomain.com  → VPS_IP
```

Use a fresh Ubuntu 22.04 or 24.04 VPS. The script must run as `root`; it installs Node.js 22, PM2, Nginx, Certbot, Fail2ban and enables UFW for SSH, HTTP and HTTPS.

```bash
ssh root@YOUR_VPS_IP
git clone <repository-url> /opt/uniform-store
cd /opt/uniform-store
bash .github/scripts/setup-vps.sh yourdomain.com ops@yourdomain.com
```

On the first run, the script creates `/opt/uniform-store/.env` then exits. Fill in its real values, then run the same command again.

## 2. Production environment

In root `.env`, set at least these values. Never commit this file.

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
DB_SSL=true

R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=uniform-store
R2_PUBLIC_URL=https://assets.yourdomain.com

USER_JWT_SECRET=<strong-random-secret>
ADMIN_JWT_SECRET=<strong-random-secret>
DOMAIN=yourdomain.com
CORS_ORIGINS=https://admin.yourdomain.com
```

The setup script generates the required build-time frontend configuration:

```env
# storefront/.env.local
VENDURE_SHOP_API_URL=http://127.0.0.1:3000/shop-api
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_STORAGE_URL=https://assets.yourdomain.com

# admin/.env.local
NEXT_PUBLIC_ADMIN_API_URL=https://admin.yourdomain.com/api/v1/admin
```

`VENDURE_SHOP_API_URL` deliberately uses the VPS loopback interface. It must not point at the public storefront domain because the GraphQL compatibility API runs on port 3000.

The second setup run obtains Let's Encrypt certificates, builds all apps, runs migrations, starts PM2 and validates local health endpoints.

## 3. GitHub Actions deployment

Add these repository secrets:

| Secret | Value |
| --- | --- |
| `VPS_HOST` | VPS IP address or hostname |
| `VPS_USER` | `root` when using the setup above |
| `VPS_SSH_KEY` | private key corresponding to an authorized VPS SSH key |
| `VPS_PORT` | optional SSH port; defaults to `22` |

Pull requests to `main` install dependencies, typecheck all apps, lint storefront code and run backend tests. A push to `main` deploys only after verification succeeds. Deploy builds first, runs pending migrations, restarts or starts PM2 processes and checks service health before completing.

## 4. Manual deploy and operations

```bash
ssh root@YOUR_VPS_IP
cd /opt/uniform-store
bash .github/scripts/deploy.sh
```

Useful checks:

```bash
pm2 status
pm2 logs --lines 100
curl -fsS http://127.0.0.1:3000/health
curl -fsS http://127.0.0.1:3002/api/v1/admin/health
sudo nginx -t
sudo certbot renew --dry-run
```

The deploy script resets tracked files to `origin/main`. Keep production-only configuration exclusively in ignored environment files, not as uncommitted edits to tracked files on the VPS.
