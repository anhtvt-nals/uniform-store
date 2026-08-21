#!/usr/bin/env bash
# Production VPS bootstrap for Ubuntu 22.04/24.04.
# Run as a regular deployment user (for example, ubuntu):
#   bash .github/scripts/setup-vps.sh example.com ops@example.com
set -euo pipefail

DOMAIN="${1:?Usage: bash .github/scripts/setup-vps.sh <domain> <letsencrypt-email>}"
LETSENCRYPT_EMAIL="${2:?Usage: bash .github/scripts/setup-vps.sh <domain> <letsencrypt-email>}"
APP_DIR="$(git rev-parse --show-toplevel 2>/dev/null || true)"

DEPLOY_USER="$(id -un)"
DEPLOY_HOME="${HOME}"

if [[ "${EUID}" -eq 0 ]]; then
    echo "Run this script as the deployment user (for example, ubuntu), not as root."
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

sudo -v

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
    cat <<NGINX | sudo tee /etc/nginx/sites-available/uniform-store >/dev/null
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

ensure_swap() {
    if sudo swapon --show --noheadings | grep -q .; then
        return
    fi

    echo "No swap detected; creating a 2GB swap file for dependency installation and builds..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile >/dev/null
    sudo swapon /swapfile
    if ! sudo grep -q '^/swapfile ' /etc/fstab; then
        echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab >/dev/null
    fi
}

echo "Setting up ${DOMAIN} from ${APP_DIR}"

sudo apt-get update
sudo apt-get install -y ca-certificates curl git build-essential fail2ban nginx certbot python3-certbot-nginx ufw

NODE_MAJOR="$(node --version 2>/dev/null | sed -E 's/^v([0-9]+).*/\1/' || true)"
if [[ "${NODE_MAJOR}" != "22" ]]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
    sudo npm install -g pm2
fi
sudo env PATH="$PATH" pm2 startup systemd -u "${DEPLOY_USER}" --hp "${DEPLOY_HOME}"

sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
ensure_swap

cd "${APP_DIR}"
sudo chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"
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
sudo ln -sf /etc/nginx/sites-available/uniform-store /etc/nginx/sites-enabled/uniform-store
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx

echo "Requesting TLS certificates. Ensure ${DOMAIN} and admin.${DOMAIN} already point to this VPS."
sudo certbot --nginx --non-interactive --agree-tos --redirect --email "${LETSENCRYPT_EMAIL}" -d "${DOMAIN}" -d "admin.${DOMAIN}"
sudo nginx -t
sudo systemctl reload nginx

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
npm ci --workspaces --prefer-offline --no-audit --no-fund
(cd backend && npx nest build storefront-api && npx nest build admin-api)
(cd storefront && npm run build)
(cd admin && npm run build)
(cd backend && npm run migration:run)

sudo -H pm2 delete uniform-storefront-api uniform-admin-api uniform-storefront uniform-admin 2>/dev/null || true
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
