# Development Roadmap

## Phase 1: Foundation (Week 1-2)

### 1.1 Project Setup
- [ ] Initialize NestJS monorepo at `backend/` with nest-cli.json
- [ ] Create apps/storefront-api and apps/admin-api (NestJS apps)
- [ ] Create libs/common, libs/database, libs/shared (NestJS libraries)
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up Supabase project (database, auth, API keys)
- [ ] Configure environment variables (.env.example)
- [ ] Create Docker Compose for local dev (Postgres, Redis, MinIO)

### 1.2 Database (TypeORM)
- [ ] Set up TypeORM data source configuration
- [ ] Create all entity files (see database.md)
- [ ] Write migration files for all tables
- [ ] Implement Row Level Security policies
- [ ] Create seed data script
- [ ] Test database connection and migrations

### 1.3 Core Infrastructure
- [ ] Global ValidationPipe (class-validator, whitelist, transform)
- [ ] Global HttpExceptionFilter (consistent error responses)
- [ ] Global TransformInterceptor (response envelope: success/data/meta)
- [ ] Structured JSON logging interceptor (request ID, duration)
- [ ] Request ID middleware (UUID per request, X-Request-Id header)
- [ ] CORS configuration
- [ ] Rate limiting setup (@nestjs/throttler)
- [ ] Swagger/OpenAPI setup (/api/docs)
- [ ] Cache abstraction interface + in-memory implementation
- [ ] S3 storage service (AWS SDK v3, presigned URLs)
- [ ] Health check module (@nestjs/terminus)
- [ ] Graceful shutdown hooks

### 1.4 Shared Guards & Decorators
- [ ] SupabaseAuthGuard — validates Supabase JWT, attaches user
- [ ] AdminAuthGuard — validates admin JWT, attaches admin
- [ ] OptionalAuthGuard — attaches user if token present, continues if not
- [ ] @CurrentUser() decorator
- [ ] @SessionId() decorator

## Phase 2: Storefront API (Week 3-4)

### 2.1 Auth Module
- [ ] POST /api/v1/auth/register
- [ ] POST /api/v1/auth/verify
- [ ] POST /api/v1/auth/login
- [ ] POST /api/v1/auth/logout
- [ ] POST /api/v1/auth/forgot-password
- [ ] POST /api/v1/auth/reset-password

### 2.2 Products Module
- [ ] GET /api/v1/products (search, filters, pagination, sort)
- [ ] GET /api/v1/products/:slug (detail with variants, options, assets)

### 2.3 Collections Module
- [ ] GET /api/v1/collections (top-level with children)
- [ ] GET /api/v1/collections/:slug (detail)
- [ ] GET /api/v1/collections/:slug/products (products in collection)

### 2.4 Search Module
- [ ] GET /api/v1/search (full-text search with faceted filters)

### 2.5 Cart Module
- [ ] GET /api/v1/cart (current cart with totals)
- [ ] POST /api/v1/cart/items (add item, check stock)
- [ ] PATCH /api/v1/cart/items/:lineId (update quantity)
- [ ] DELETE /api/v1/cart/items/:lineId (remove item)
- [ ] POST /api/v1/cart/promotions (apply coupon)
- [ ] DELETE /api/v1/cart/promotions/:code (remove coupon)

### 2.6 Checkout Module
- [ ] POST /api/v1/checkout/customer (set guest customer)
- [ ] POST /api/v1/checkout/shipping-address
- [ ] POST /api/v1/checkout/billing-address
- [ ] GET /api/v1/checkout/shipping-methods
- [ ] POST /api/v1/checkout/shipping-method
- [ ] GET /api/v1/checkout/payment-methods
- [ ] POST /api/v1/checkout/payment (place order)
- [ ] GET /api/v1/checkout/summary

### 2.7 Orders Module
- [ ] GET /api/v1/orders (customer order history)
- [ ] GET /api/v1/orders/:code (order detail)

### 2.8 Account Module
- [ ] GET /api/v1/account/profile
- [ ] PATCH /api/v1/account/profile
- [ ] GET /api/v1/account/addresses
- [ ] POST /api/v1/account/addresses
- [ ] PATCH /api/v1/account/addresses/:id
- [ ] DELETE /api/v1/account/addresses/:id
- [ ] POST /api/v1/account/change-email
- [ ] POST /api/v1/account/change-password

### 2.9 Articles Module
- [ ] GET /api/v1/articles (list with pagination, category/tag filter)
- [ ] GET /api/v1/articles/:slug
- [ ] GET /api/v1/article-categories
- [ ] GET /api/v1/article-tags

### 2.10 Pages Module
- [ ] GET /api/v1/pages/:slug

## Phase 3: Admin API (Week 5-6)

### 3.1 Admin Auth
- [ ] POST /api/v1/admin/auth/login
- [ ] POST /api/v1/admin/auth/logout
- [ ] GET /api/v1/admin/auth/me

### 3.2 Admin Product Management
- [ ] CRUD products
- [ ] CRUD variants
- [ ] Asset upload/delete (via S3 presigned URLs)
- [ ] CRUD collections
- [ ] CRUD facet groups + facet values

### 3.3 Admin Order Management
- [ ] GET /api/v1/admin/orders (list with filters, pagination)
- [ ] GET /api/v1/admin/orders/:id
- [ ] PATCH /api/v1/admin/orders/:id/status
- [ ] GET /api/v1/admin/orders/:id/history

### 3.4 Admin Customer Management
- [ ] GET /api/v1/admin/customers
- [ ] GET /api/v1/admin/customers/:id
- [ ] GET /api/v1/admin/customers/:id/orders

### 3.5 Admin Content Management
- [ ] CRUD articles, categories, tags
- [ ] CRUD promotions
- [ ] CRUD shipping methods
- [ ] CRUD payment methods

### 3.6 Admin Dashboard
- [ ] GET /api/v1/admin/dashboard/stats
- [ ] GET /api/v1/admin/dashboard/revenue
- [ ] GET /api/v1/admin/dashboard/orders
- [ ] GET /api/v1/admin/dashboard/top-products

## Phase 4: Infrastructure (Week 7)

- [ ] Dockerfiles (multi-stage build for each NestJS app)
- [ ] docker-compose.yml (postgres, redis, minio, storefront-api, admin-api, nginx)
- [ ] Health checks (/health, /ready)
- [ ] Graceful shutdown (NestJS lifecycle hooks)
- [ ] CI/CD (GitHub Actions: lint, test, build, deploy)
- [ ] Cache layer: Redis implementation of CacheService interface

## Phase 5: Frontend Migration (Week 8)

- [ ] Create REST API client in frontend (replace Vendure GraphQL client)
- [ ] Update all server actions to use REST endpoints
- [ ] E2E testing (checkout, auth, product browsing)
- [ ] Error handling review
- [ ] Loading states review
- [ ] SEO metadata review
- [ ] Performance audit
- [ ] Security audit
