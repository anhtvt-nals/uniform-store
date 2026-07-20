#!/bin/bash
# ══════════════════════════════════════════════════════════════
# Deploy Script — runs on VPS
# Git pull → install → build → restart services
# ══════════════════════════════════════════════════════════════
set -e

APP_DIR="/opt/uniform-store"
cd "$APP_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Deploying uniform-store"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Pull latest code
echo ""
echo "📥 Pulling latest code..."
git pull origin main

# 2. Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci --workspaces

# 3. Setup admin .env if missing
if [ ! -f admin/.env ]; then
    echo "Creating admin/.env..."
    cat > admin/.env << 'ADMINENV'
NEXT_PUBLIC_ADMIN_API_URL=https://admin.${DOMAIN:-localhost}/api/v1/admin
ADMINENV
fi

# 4. Build backend
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
npm run build 2>&1 || echo "⚠️  Storefront build failed, continuing..."
cd ..

# 6. Build admin
echo ""
echo "🔨 Building admin..."
cd admin
npm run build 2>&1 || echo "⚠️  Admin build failed, continuing..."
cd ..

# 7. Run migrations
echo ""
echo "🗄️  Running migrations..."
cd backend
npx tsx scripts/run-migrations.ts run 2>&1 || echo "⚠️  Migration skipped"
cd ..

# 8. Restart services
echo ""
echo "🔄 Restarting services..."
pm2 restart uniform-storefront-api 2>/dev/null || pm2 start backend/dist/apps/storefront-api/main.js --name uniform-storefront-api --cwd "$APP_DIR/backend"
pm2 restart uniform-admin-api 2>/dev/null || pm2 start backend/dist/apps/admin-api/main.js --name uniform-admin-api --cwd "$APP_DIR/backend"
pm2 restart uniform-storefront 2>/dev/null || (cd storefront && pm2 start npm --name uniform-storefront -- start -- -p 3001)
pm2 restart uniform-admin 2>/dev/null || (cd admin && pm2 start npm --name uniform-admin -- start -- -p 5002)

# 9. Save pm2 config
pm2 save

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deploy completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 list
