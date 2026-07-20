#!/bin/bash
# ══════════════════════════════════════════════════════════════
# VPS Initial Setup Script
# Run ONCE on a fresh Ubuntu 22.04/24.04 VPS
# Usage: bash setup-vps.sh yourdomain.com
# ══════════════════════════════════════════════════════════════
set -e

DOMAIN="${1:-localhost}"
APP_DIR="/opt/uniform-store"

echo "🔧 Setting up VPS for: $DOMAIN"

# ─── System packages ───
apt update && apt upgrade -y
apt install -y curl git build-essential ufw fail2ban

# ─── Node.js 22 ───
if ! command -v node &>/dev/null; then
    echo "📦 Installing Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
fi

# ─── PM2 ───
if ! command -v pm2 &>/dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
fi

# ─── Docker (for PostgreSQL + MinIO only) ───
if ! command -v docker &>/dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
fi

if ! docker compose version &>/dev/null 2>&1; then
    apt install -y docker-compose-plugin
fi

# ─── Nginx ───
if ! command -v nginx &>/dev/null; then
    echo "📦 Installing Nginx..."
    apt install -y nginx
fi

# ─── Firewall ───
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ─── Create app directory ───
mkdir -p "$APP_DIR"

# ─── Clone repo ───
if [ ! -d "$APP_DIR/.git" ]; then
    echo "📦 Please clone the repo manually:"
    echo "   git clone <your-repo-url> $APP_DIR"
fi

cd "$APP_DIR"

# ─── Create .env ───
if [ ! -f .env ]; then
    cat > .env << EOF
# ─── Database ───
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_DATABASE=uniform_store
DB_SSL=false

# ─── Auth ───
JWT_SECRET=$(openssl rand -hex 32)

# ─── Supabase (optional) ───
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ─── Storage ───
STORAGE_ENDPOINT=http://127.0.0.1:9000
STORAGE_ACCESS_KEY=${MINIO_ACCESS_KEY:-minioadmin}
STORAGE_SECRET_KEY=${MINIO_SECRET_KEY:-minioadmin}
STORAGE_BUCKET=uniform-store
STORAGE_PUBLIC_URL=https://storage.${DOMAIN}

# ─── Domain ───
DOMAIN=${DOMAIN}
CORS_ORIGINS=https://admin.${DOMAIN}

# ─── Ports ───
STOREFRONT_PORT=3001
ADMIN_API_PORT=3002
ADMIN_PORT=5002
EOF
    chmod 600 .env
    echo "⚠️  Edit .env with real secrets: nano $APP_DIR/.env"
fi

# ─── Start infrastructure ───
echo "🐳 Starting PostgreSQL + MinIO..."
docker compose -f docker-compose.infra.yml up -d

# ─── Create admin .env ───
if [ ! -f admin/.env ]; then
    cat > admin/.env << EOF
NEXT_PUBLIC_ADMIN_API_URL=https://admin.${DOMAIN}/api/v1/admin
EOF
    echo "Created admin/.env"
fi

# ─── Install app dependencies ───
echo "📦 Installing dependencies..."
npm ci --workspaces

# ─── Build apps ───
echo "🔨 Building backend..."
cd backend && npx nest build storefront-api && npx nest build admin-api && cd ..

echo "🔨 Building storefront..."
cd storefront && npm run build 2>&1 || echo "⚠️  Storefront build skipped"
cd ..

echo "🔨 Building admin..."
cd admin && npm run build 2>&1 || echo "⚠️  Admin build skipped"
cd ..

# ─── Start apps with PM2 ───
echo "🚀 Starting apps..."
pm2 start backend/dist/apps/storefront-api/main.js --name uniform-storefront-api --cwd "$APP_DIR/backend"
pm2 start backend/dist/apps/admin-api/main.js --name uniform-admin-api --cwd "$APP_DIR/backend"
cd storefront && pm2 start npm --name uniform-storefront -- start -- -p 3001 && cd ..
cd admin && pm2 start npm --name uniform-admin -- start -- -p 5002 && cd ..
pm2 save

# ─── Nginx config ───
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/uniform-store << NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 443 ssl http2;
    server_name admin.${DOMAIN};

    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location /api/ {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:5002;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX

ln -sf /etc/nginx/sites-available/uniform-store /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ─── SSL (self-signed for now) ───
mkdir -p /etc/nginx/ssl
if [ ! -f /etc/nginx/ssl/fullchain.pem ]; then
    openssl req -x509 -nodes -days 365 \
        -subj "/CN=$DOMAIN" \
        -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/privkey.pem \
        -out /etc/nginx/ssl/fullchain.pem 2>/dev/null
fi

# ─── Done ───
echo ""
echo "═══════════════════════════════════════════"
echo "✅ VPS setup complete!"
echo "═══════════════════════════════════════════"
echo ""
echo "Services:"
echo "  PostgreSQL  → 127.0.0.1:5432 (Docker)"
echo "  MinIO       → 127.0.0.1:9000 (Docker)"
echo "  Storefront  → 127.0.0.1:3001 (PM2)"
echo "  Admin API   → 127.0.0.1:3002 (PM2)"
echo "  Admin UI    → 127.0.0.1:5002 (PM2)"
echo "  Nginx       → 80/443"
echo ""
echo "Next steps:"
echo "  1. Edit .env: nano $APP_DIR/.env"
echo "  2. Setup DNS:"
echo "       $DOMAIN → $(curl -s ifconfig.me)"
echo "       admin.$DOMAIN → $(curl -s ifconfig.me)"
echo "  3. Install Let's Encrypt:"
echo "       certbot --nginx -d $DOMAIN -d admin.$DOMAIN"
echo "  4. Add GitHub Secrets for auto-deploy"
echo ""
