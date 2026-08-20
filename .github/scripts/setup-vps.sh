#!/usr/bin/env bash
# Production VPS bootstrap for Ubuntu 22.04/24.04.
# Run from a cloned repository as root:
#   bash .github/scripts/setup-vps.sh example.com ops@example.com
set -euo pipefail

DOMAIN="${1:?Usage: bash .github/scripts/setup-vps.sh <domain> <letsencrypt-email>}"
LETSENCRYPT_EMAIL="${2:?Usage: bash .github/scripts/setup-vps.sh <domain> <letsencrypt-email>}"
APP_DIR="$(git rev-parse --show-toplevel 2>/dev/null || true)"

if [[ "${EUID}" -ne 0 ]]; then
    echo "Run this script as root (or with sudo)."
    exit 1
fi

if [[ -z "${APP_DIR}" || ! -f "${APP_DIR}/package.json" ]]; then
    echo "Run this script from inside the cloned uniform-store repository."
    exit 1
fi

if [[ "${DOMAIN}" == "localhost" ]]; then
    echo "A public domain is required to issue a Let's Encrypt certificate."
    exit 1
fi

env_value() {
    local key="$1"
    sed -nE "s/^${key}=(.*)$/\1/p" "${APP_DIR}/.env" | tail -n 1
}

require_env_value() {
    local key="$1"
    local value
    value="$(env_value "${key}")"
    if [[ -z "${value}" || "${value}" == *"your-"* || "${value}" == *"GENERATE_"* || "${value}" == *"["* ]]; then
        echo "Missing or placeholder value for ${key} in ${APP_DIR}/.env"
        exit 1
    fi
}

write_nginx_config() {
    cat > /etc/nginx/sites-available/uniform-store <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

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
    listen 80;
    listen [::]:80;
    server_name admin.${DOMAIN};

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
}

wait_for_http() {
    local url="$1"
    local label="$2"
    for _ in {1..30}; do
        if curl --fail --silent --show-error "${url}" >/dev/null; then
            echo "✓ ${label} is healthy"
            return 0
        fi
        sleep 2
    done
    echo "${label} did not become healthy: ${url}"
    return 1
}

echo "Setting up ${DOMAIN} from ${APP_DIR}"

apt-get update
apt-get install -y ca-certificates curl git build-essential fail2ban nginx certbot python3-certbot-nginx

NODE_MAJOR="$(node --version 2>/dev/null | sed -E 's/^v([0-9]+).*/\1/' || true)"
if [[ "${NODE_MAJOR}" != "22" ]]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
    npm install -g pm2
fi
pm2 startup systemd -u root --hp /root

# ufw allow OpenSSH
# ufw allow 80/tcp
# ufw allow 443/tcp
# ufw --force enable

cd "${APP_DIR}"
if [[ ! -f .env ]]; then
    cp .env.example .env
    chmod 600 .env
    echo "Created ${APP_DIR}/.env. Fill in Supabase, R2, JWT, DOMAIN and CORS settings, then run this script again."
    exit 0
fi
chmod 600 .env

for key in DATABASE_URL R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET R2_PUBLIC_URL USER_JWT_SECRET ADMIN_JWT_SECRET; do
    require_env_value "${key}"
done

if [[ "$(env_value NODE_ENV)" != "production" ]]; then
    echo "NODE_ENV must be set to production in ${APP_DIR}/.env"
    exit 1
fi

cat > admin/.env.local <<EOF
NEXT_PUBLIC_ADMIN_API_URL=https://admin.${DOMAIN}/api/v1/admin
EOF

cat > storefront/.env.local <<EOF
VENDURE_SHOP_API_URL=http://127.0.0.1:3000/shop-api
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}
NEXT_PUBLIC_STORAGE_URL=$(env_value R2_PUBLIC_URL)
EOF
chmod 600 admin/.env.local storefront/.env.local

write_nginx_config
ln -sf /etc/nginx/sites-available/uniform-store /etc/nginx/sites-enabled/uniform-store
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx
systemctl reload nginx

echo "Requesting TLS certificates. Ensure ${DOMAIN} and admin.${DOMAIN} already point to this VPS."
certbot --nginx --non-interactive --agree-tos --redirect --email "${LETSENCRYPT_EMAIL}" -d "${DOMAIN}" -d "admin.${DOMAIN}"
nginx -t
systemctl reload nginx

npm ci --workspaces
(cd backend && npx nest build storefront-api && npx nest build admin-api)
(cd storefront && npm run build)
(cd admin && npm run build)
(cd backend && npm run migration:run)

pm2 delete uniform-storefront-api uniform-admin-api uniform-storefront uniform-admin 2>/dev/null || true
pm2 start "${APP_DIR}/backend/dist/apps/storefront-api/main.js" --name uniform-storefront-api --cwd "${APP_DIR}/backend" --time
pm2 start "${APP_DIR}/backend/dist/apps/admin-api/main.js" --name uniform-admin-api --cwd "${APP_DIR}/backend" --time
pm2 start npm --name uniform-storefront --cwd "${APP_DIR}/storefront" --time -- start -- -p 3001
pm2 start npm --name uniform-admin --cwd "${APP_DIR}/admin" --time -- start -- -p 5002

wait_for_http http://127.0.0.1:3000/health "Storefront API"
wait_for_http http://127.0.0.1:3002/api/v1/admin/health "Admin API"
wait_for_http http://127.0.0.1:3001 "Storefront"
wait_for_http http://127.0.0.1:5002 "Admin UI"
pm2 save

echo "Setup complete. HTTPS is active for https://${DOMAIN} and https://admin.${DOMAIN}."
