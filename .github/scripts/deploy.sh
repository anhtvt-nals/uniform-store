#!/bin/bash
# ══════════════════════════════════════════════════════════════
# Deploy Script — runs on VPS
# Git pull → install → build → restart services
# ══════════════════════════════════════════════════════════════
set -euo pipefail

APP_DIR="$(git rev-parse --show-toplevel)"
cd "$APP_DIR"

wait_for_http() {
    local url="$1"
    local label="$2"
    for _ in {1..30}; do
        if curl --fail --silent --show-error "$url" >/dev/null; then
            echo "✓ $label is healthy"
            return 0
        fi
        sleep 2
    done
    echo "$label did not become healthy: $url"
    return 1
}

restart_or_start_script() {
    local name="$1"
    local script="$2"
    local cwd="$3"
    if pm2 describe "$name" >/dev/null 2>&1; then
        pm2 restart "$name" --update-env
    else
        pm2 start "$script" --name "$name" --cwd "$cwd" --time
    fi
}

restart_or_start_next() {
    local name="$1"
    local cwd="$2"
    local port="$3"
    if pm2 describe "$name" >/dev/null 2>&1; then
        pm2 restart "$name" --update-env
    else
        pm2 start npm --name "$name" --cwd "$cwd" --time -- start -- -p "$port"
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Deploying uniform-store"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Pull latest code
echo ""
echo "📥 Pulling latest code..."
echo "Resetting workspace..."
git fetch origin main
git reset --hard origin/main

for env_file in .env storefront/.env.local admin/.env.local; do
    if [ ! -s "$env_file" ]; then
        echo "Missing required deployment configuration: $env_file"
        exit 1
    fi
done

# 2. Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci --workspaces

# 3. Build backend
echo ""
echo "🔨 Building backend..."
cd backend
npx nest build storefront-api
npx nest build admin-api
cd ..

# 5. Build storefront
echo ""
echo "🔨 Building storefront..."
cd storefront
npm run build
cd ..

# 6. Build admin
echo ""
echo "🔨 Building admin..."
cd admin
npm run build
cd ..

# 7. Run migrations
echo ""
echo "🗄️  Running migrations..."
cd backend
npm run migration:run
cd ..

# 8. Restart services and verify them
echo ""
echo "🔄 Restarting services..."
restart_or_start_script uniform-storefront-api "$APP_DIR/backend/dist/apps/storefront-api/main.js" "$APP_DIR/backend"
restart_or_start_script uniform-admin-api "$APP_DIR/backend/dist/apps/admin-api/main.js" "$APP_DIR/backend"
restart_or_start_next uniform-storefront "$APP_DIR/storefront" 3001
restart_or_start_next uniform-admin "$APP_DIR/admin" 5002

wait_for_http http://127.0.0.1:3000/health "Storefront API"
wait_for_http http://127.0.0.1:3002/api/v1/admin/health "Admin API"
wait_for_http http://127.0.0.1:3001 "Storefront"
wait_for_http http://127.0.0.1:5002 "Admin UI"

# 9. Save pm2 config
pm2 save

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deploy completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 list
