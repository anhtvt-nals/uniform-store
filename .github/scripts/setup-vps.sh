#!/bin/bash
# ══════════════════════════════════════════════════════════════
# VPS Initial Setup Script
# Run ONCE on a fresh Ubuntu 22.04/24.04 VPS
# Usage: bash setup-vps.sh yourdomain.com
# ══════════════════════════════════════════════════════════════
set -e

DOMAIN="${1:-localhost}"
APP_DIR="$(pwd)"

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

# ─── Create environment templates ───
if [ ! -f .env ]; then
    cp .env.example .env
    chmod 600 .env
    echo "⚠️  Fill in .env with Supabase and Cloudflare R2 credentials: nano $APP_DIR/.env"
fi

# ─── Create frontend build-time environment files ───
if [ ! -f admin/.env.local ]; then
    cat > admin/.env.local << EOF
NEXT_PUBLIC_ADMIN_API_URL=https://admin.${DOMAIN}/api/v1/admin
EOF
    echo "Created admin/.env.local"
fi

if [ ! -f storefront/.env.local ]; then
    cat > storefront/.env.local << EOF
VENDURE_SHOP_API_URL=https://${DOMAIN}/shop-api
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}
EOF
    echo "Created storefront/.env.local"
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
pm2 start "$APP_DIR/backend/dist/apps/storefront-api/main.js" --name uniform-storefront-api --cwd "$APP_DIR/backend"
pm2 start "$APP_DIR/backend/dist/apps/admin-api/main.js" --name uniform-admin-api --cwd "$APP_DIR/backend"
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
echo "  Supabase PostgreSQL → managed service"
echo "  Cloudflare R2       → managed service"
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
