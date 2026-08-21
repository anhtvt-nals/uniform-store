# Project Memory

## Project Overview

Minh An Uniform — Vietnamese corporate uniform manufacturing ecommerce platform. Next.js storefront selling custom uniforms (áo thun, áo sơ mi, đồng phục công sở, etc.) to businesses.

**Stack**: Next.js frontend + NestJS (TypeScript) backend + Supabase PostgreSQL + Cloudflare R2

## Current State

| Component | Status | Location |
|---|---|---|
| Frontend (Next.js) | ✅ Complete | `apps/storefront/` |
| Backend (NestJS) | ✅ Complete | `backend/` — NestJS monorepo |
| Admin Panel | ✅ Running | `admin/` — Next.js 16, port 5002 |
| Deploy | ✅ Complete | Node.js/PM2 + Nginx, using managed Supabase PostgreSQL and Cloudflare R2 |

## Tech Stack

- **Frontend**: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS (TypeScript), NestJS monorepo mode
- **Database**: Supabase PostgreSQL via `DATABASE_URL`
- **ORM**: TypeORM with migrations
- **Validation**: class-validator + class-transformer
- **API Docs**: @nestjs/swagger (OpenAPI)
- **Auth (customers)**: Custom JWT (bcrypt passwords) — no longer Supabase
- **Auth (admins)**: Custom JWT (bcrypt passwords)
- **Storage**: Cloudflare R2 via its S3-compatible API
- **Cache**: In-memory LRU initially → Redis later
- **Rate Limiting**: @nestjs/throttler
- **Logging**: Structured JSON (NestJS Logger + interceptor)

## Frontend Routes

All under `/[locale]` (vi, en, de):

| Route | Page |
|---|---|
| `/` | Homepage |
| `/search` | Product search |
| `/product/[slug]` | Product detail |
| `/collection/[slug]` | Collection listing |
| `/cart` | Shopping cart |
| `/checkout` | Multi-step checkout |
| `/order-confirmation/[code]` | Order confirmation |
| `/sign-in`, `/register`, `/forgot-password`, `/reset-password` | Auth |
| `/account/profile`, `/account/addresses`, `/account/orders` | Account |
| `/news`, `/news/[slug]` | Articles |
| `/dich-vu`, `/ve-chung-toi` | Static pages |

## Frontend Data Flow

```
User Action → Server Action ('use server')
  → REST API call to /api/v1/*
    → NestJS Backend → Postgres
  → updateTag('cart') / revalidatePath()
  → UI re-renders
```

## Frontend Cache Tags

- Locale-only: `{tag}-{locale}` (collections, blogs, countries, footer, navbar)
- Currency-dependent: `{tag}-{locale}-{currency}` (products, featured, collection-*)
- Revalidation: `POST /api/revalidate` webhook (Bearer token)

## Frontend Auth Flow

- Token in cookie: `vendure-auth-token`
- Sent as `Authorization: Bearer <token>`
- Custom JWT (bcrypt) — verified by `UserAuthGuard`
- Guest checkout uses `session_id` cookie

## Key Frontend Files

| File | Purpose |
|---|---|
| `src/lib/vendure/api.ts` | GraphQL client (to be replaced with REST) |
| `src/lib/vendure/queries.ts` | GraphQL queries (data contracts) |
| `src/lib/vendure/mutations.ts` | GraphQL mutations (data contracts) |
| `src/lib/vendure/fragments.ts` | GraphQL fragments (data shapes) |
| `src/lib/auth.ts` | Auth token cookie management |
| `src/lib/currency.ts` | Currency cookie management |
| `src/app/api/revalidate/route.ts` | Cache revalidation webhook |

## Development Rules

### Coding Style (TypeScript)
- Prettier + ESLint formatting
- Strong typing, avoid `any` (use `unknown` or generics)
- Use class-validator decorators for validation
- Descriptive names, small focused functions/methods

### Patterns
- NestJS modules with controller/service/repository layers
- Constructor-based dependency injection
- DTOs for request/response (never expose TypeORM entities directly)
- Guards for authentication
- Interceptors for logging, caching, response transformation
- Filters for exception handling
- Custom decorators for user context

### Avoid
- Global state / mutable singletons
- Business logic in controllers
- Exposing TypeORM entities in API responses
- `any` type usage
- Hardcoded configuration
- Dead code, duplicated logic, unnecessary comments

## Backend Skeleton — Structure

```
backend/
├── apps/
│   ├── storefront-api/          # NestJS app (port 3000)
│   │   ├── src/
│   │   │   ├── main.ts          # Bootstrap: Swagger, CORS, Helmet, ValidationPipe
│   │   │   ├── app.module.ts    # Root module (11 feature modules)
│   │   │   ├── auth/            # Custom JWT + bcrypt auth (register, login, etc.)
│   │   │   ├── products/        # Product listing, detail, variants, related, featured
│   │   │   ├── brands/          # Brand listing, detail, products
│   │   │   ├── collections/     # Category tree, category products
│   │   │   ├── search/          # Full-text search with facets
│   │   │   ├── cart/            # Cart CRUD, guest + auth carts, merge, coupons, totals
│   │   │   ├── checkout/        # Multi-step checkout flow
│   │   │   ├── orders/          # Order history (customer view)
│   │   │   ├── account/         # Profile, addresses, password
│   │   │   ├── articles/        # Blog/articles listing
│   │   │   ├── pages/           # Banners, settings, countries, channel
│   │   │   └── health/          # Liveness + readiness probes
│   │   ├── Dockerfile
│   │   └── test/
│   └── admin-api/               # NestJS app (port 3002)
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts    # Root module (18 feature modules)
│       │   ├── auth/            # Custom JWT (bcrypt passwords)
│       │   ├── products/        # Full CRUD + variants + images + option groups
│       │   ├── inventory/       # Stock management, adjustments, history, reservations, low stock alerts
│       │   ├── brands/          # Full CRUD + restore + logo
│       │   ├── collections/     # Category CRUD + product assignment
│       │   ├── facets/          # Facet groups + values CRUD
│       │   ├── orders/          # Order management, status transitions
│       │   ├── customers/       # Customer list, detail, orders, addresses (real CRUD with pagination)
│       │   ├── articles/        # Content CRUD + categories + tags
│       │   ├── promotions/      # Discount rules + coupon codes CRUD
│       │   ├── shipping/        # Shipping methods CRUD
│       │   ├── payment/         # Payment methods CRUD
│   │   ├── uploads/         # S3 upload/delete via presigned URLs or direct multipart, AssetEntity gallery, entity linking
│       │   ├── dashboard/       # Stats, revenue, orders, top products (real DB aggregations)
│       │   ├── activity-logs/   # Full read-only audit trail (real DB queries)
│       │   ├── permissions/     # Admin user role management (real CRUD)
│       │   └── health/
│       ├── Dockerfile
│       └── test/
├── libs/
│   ├── common/                  # Shared: guards, interceptors, filters, decorators, DTOs, pipes
│   ├── database/                # TypeORM entities, migrations, data source
│   └── shared/                  # Shared: storage (S3), cache (memory→Redis), config
├── migrations/                  # SQL migration files (28 files)
├── nest-cli.json                # Monorepo configuration (5 projects)
├── package.json                 # Workspace root (apps/*, libs/*)
├── tsconfig.json                # Path aliases: @app/common, @app/database, @app/shared
├── .env.example                 # All environment variables documented
└── .eslintrc.js                 # ESLint + Prettier config
```

## Backend Skeleton Status

| Component | Status | Details |
|---|---|---|
| Root configs | ✅ Complete | package.json, tsconfig, nest-cli, eslint, prettier, .env.example |
| Shared libs | ✅ Complete | 3 libs (common, database, shared), 44 files |
| Storefront API | ✅ Complete | 12 modules + 1 GraphQL proxy, 77+ files |
| Admin API | ✅ Complete | 18 modules (2 new: activity-logs, permissions), 85+ files |
| Deploy configuration | ✅ Complete | Docker files removed; applications run directly with Node.js/PM2 and Nginx |
| Database config | ✅ Supabase | `DATABASE_URL` is required and SSL is configured via `DB_SSL` |
| Entities | ✅ Complete | AssetEntity, UserEntity, RoleEntity, UserRoleEntity, AdminUserEntity, CategoryEntity, BrandEntity, ProductEntity, ProductVariantEntity, ProductImageEntity, ProductOptionGroupEntity, ProductOptionEntity, ProductVariantOptionEntity, InventoryEntity, StockHistoryEntity, CartEntity, CartItemEntity, CartCouponEntity, OrderEntity, OrderItemEntity, AddressEntity, DiscountEntity, CouponEntity, CouponUsageEntity, ActivityLogEntity, SettingEntity (26 entities total) |
| DB Schema Design | ✅ Complete | `.ai/database.md` updated — full schema (32 existing + 11 new tables), ASCII ERD, key decisions, migration summary. 5 new migrations added. |
| Auth implementation | ✅ Complete | Guards, decorators, storefront auth (custom JWT + bcrypt), admin auth (bcrypt + JWT). Supabase Auth removed. |
| Category implementation | ✅ Complete | Storefront (tree listing, detail, products) + Admin (full CRUD, reorder, restore, product assignment). |
| Brand implementation | ✅ Complete | Storefront (list, detail, products) + Admin (full CRUD, restore, logo update). |
| Product implementation | ✅ Complete | Storefront (list with search/filters/sort, detail, variants, related, featured) + Admin (full CRUD with variants, images, option groups, restore). |
| Business logic | ✅ Complete | Auth + categories + brands + products (with variants/options/inventory/stock history) + cart (guest/user/merge/coupons/totals) + checkout + orders fully implemented. |
| Admin Dashboard | ✅ Complete | Real DB aggregations: revenue by period, order stats (pending/processing/completed/cancelled), top products by quantity sold, customer stats. 7 tests. |
| Admin Customers | ✅ Complete | Real CRUD with pagination, search, soft-delete include, customer orders history, customer addresses. 9 tests. |
| Admin Activity Logs | ✅ Complete | Full read-only audit trail from `activity_logs` table. Pagination, filtering by action/entityType/entityId/userId, date range. Distinct actions/entity types endpoints. 8 tests. |
| Admin Permissions | ✅ Complete | Admin user list with roles, role update (super_admin can set super_admin/admin/editor/analyst). 4 tests. |
| Tests | ✅ Complete | Auth (12) + categories (17) + brands (17) + products (28) + inventory (20) + uploads (14) + cart (19) + dashboard (7) + customers (9) + activity-logs (8) + permissions (4) = **177 tests across 21 suites** |
| Database migrations | ✅ Complete | 27 SQL files in `backend/migrations/` (001–028, with gaps) |

## Running Services

| Service | URL | Status |
|---|---|---|
| Admin Dashboard (Next.js 16) | http://localhost:5002 | ✅ Running |
| Admin API (NestJS) | http://localhost:3002/api/v1/admin/health | ✅ Running |
| Storefront API (NestJS) | http://localhost:3000/health | ❌ Stopped (start with `npm run dev` in `backend/`) |
| Supabase PostgreSQL | Managed | ✅ External service |
| Cloudflare R2 | Managed | ✅ External service |

## Recent Changes

### Product SEO (2026-08-21)
- Product detail pages now generate product-specific title, description, canonical/hreflang links, Vietnamese commercial keywords, Open Graph/Twitter data, indexable robots directives, and safe `Product` plus `BreadcrumbList` JSON-LD structured data using the live product, variant, collection, and asset data.

### Production VPS Deployment (2026-08-20)
- Reworked `.github/scripts/setup-vps.sh` for Ubuntu production setup: validates root environment configuration, installs Node 22/PM2/Nginx/Certbot/UFW through `sudo`, configures loopback storefront API access, obtains Let's Encrypt certificates before serving HTTPS, creates a persistent 2GB swap file if absent, runs migrations, and validates health endpoints. PM2 and all application processes run as the `ubuntu` deployment user.
- Hardened `.github/scripts/deploy.sh` to preserve ignored environment files, build and migrate before restart, use PM2 restart/start behavior, and fail on health-check errors. CI now includes storefront linting, stops SSH deployment on script errors, and uses `VPS_APP_DIR` rather than a hard-coded `/opt` path.

### Demo News Content (2026-08-20)
- Added idempotent `npm run seed:demo-articles` in `backend/`, which creates or updates six published Vietnamese uniform-industry articles with rich HTML content, Unsplash thumbnails, article categories, and tags.

### Frontend UX Convention (2026-08-20)
- For homepage category showcases: keep the left introduction block free of container background and outer padding; place text first and a proportionate rounded banner below it.
- Category product cards use the `compact` variant (roughly half the default thumbnail height); its desktop-only, non-interactive image preview matches the card width and opens to the right, falling back to the left when viewport space is insufficient.
- Keep statistic cards on one light surface; reserve a primary border/icon accent for emphasis rather than switching one card to a dark theme. Uppercase labels use `text-foreground/70` or stronger for readable contrast.
- Floating contact actions are evenly spaced on desktop and collapse into a menu FAB on mobile.

### Demo Catalog & Homepage Category Showcase (2026-08-20)
- Added idempotent `npm run seed:demo-catalog` in `backend/`: creates or updates three root categories (`dong-phuc-cong-so`, `dong-phuc-khach-san`, `dong-phuc-ao-polo`) and six demo products with a default variant and Unsplash image per category.
- `npm run seed:demo-assets` downloads those seeded Unsplash images, uploads them to R2 with the normal `products/<product-id>/...` key convention, records them in `assets`, then links the matching `product_images` rows to the R2 public URLs.
- Rebuilt the homepage category list as three category showcases: category image, name and description on the left; six product cards in a three-column desktop grid on the right.
- Extended the GraphQL compatibility `GetTopCollections` payload with category description and featured asset, retaining its previous fields.

### Managed Infrastructure Migration (2026-08-20)
- Removed all Docker Compose files, Dockerfiles, MinIO initialization, and Docker-specific deploy setup.
- Supabase PostgreSQL is now required through `DATABASE_URL`; migration runner uses the same SSL-enabled connection.
- Cloudflare R2 is the configured object-storage provider through `R2_*` environment variables.
- Updated environment templates, PM2/Nginx deployment docs, and Next.js remote image configuration for R2 public/custom domains.
- Backend and migration tooling now load the shared root `.env`; only frontend `.env.local` files remain for Next.js build-time public values.
- Reworked pending migrations `002` and `017` for Supabase: no writes to managed `auth` schema and no `auth.uid()`-dependent RLS policies.
- Applied migrations `001`–`037` (36 files, with existing numeric gaps) to the Supabase database; migration status is 36 applied and 0 pending.

### Homepage Redesign — B2B Landing Page (2026-07-25)
Complete homepage overhaul from catalog layout to high-converting B2B landing page:
- **Hero Banner** (`hero-banner.tsx`) — Gradient hero with value prop badges, dual CTAs, floating social proof
- **Trust Bar** (`trust-bar.tsx`) — Client logo placeholder grid (Vingroup, Techcombank, etc.)
- **Product Categories** (`product-categories.tsx`) — 3-card grid (Office/Industry/Event) linked to `/search?collection=slug`
- **Manufacturing Capability** (`manufacturing-capability.tsx`) — Factory image + 4-stat grid (area, staff, capacity, QC)
- **Case Studies** (`case-studies.tsx`) — 3 project cards with company, product, timeline
- **Material Quality** (`material-quality.tsx`) — 4 color-coded material cards (cotton/poly/coolmax/bamboo)
- **Pricing Reference** (`pricing-reference.tsx`) — Responsive pricing table (3 products × 3 tiers)
- **Final CTA** (`final-cta.tsx`) — Gradient closing banner with single CTA
- **Mobile Sticky CTA** (`mobile-sticky-cta.tsx`) — Fixed bottom bar (Call + Quote) on mobile
- **Navbar updates** — Added process/projects/contact links, "Nhận báo giá miễn phí" CTA button
- **Translations** — Added all `Home` + `Navigation` keys to vi/en/de
- Old sections retained as files but no longer imported

### Supabase Auth Removal (2026-07-25)
- `SupabaseAuthGuard` → `UserAuthGuard` (custom JWT via jsonwebtoken + `userJwt` config)
- `OptionalAuthGuard` → `OptionalUserAuthGuard`
- `AuthService` rewritten: bcrypt password hashing + JWT signing/verification instead of Supabase admin API
- `UserEntity` gains `passwordHash` column; migration 031 added
- `app.config.ts`: Removed `supabase` namespace, added `userJwt` with `secret` + `expiresIn`
- All controllers (auth, cart, checkout, orders) updated to new guards
- `@supabase/supabase-js` removed from dependencies
- `supabase.co` SSL auto-detection removed from `database.module.ts` + `data-source.ts`

### Webpack Circular Dependency Fix (2026-07-25)
- Created `backend/webpack.config.js` — externals `@nestjs/typeorm` + `typeorm` to break bundle loop
- Re-enabled `webpack: true` in `nest-cli.json`
- Dockerfiles: compile libs separately, copy to `node_modules/@app/*`, then build app

## Recent Fixes

### Config Namespace (2026-07-17)
Config is registered under `registerAs('app', ...)`, so all `configService.get()` calls need `app.` prefix:
- `auth.service.ts`: `'supabase.url'` → `'app.supabase.url'` (and anonKey, serviceRoleKey)
- `optional-auth.guard.ts`: same fix
- `supabase-auth.guard.ts`: same fix

### Compression Import (2026-07-17)
`compression` is a CJS module. Changed both `main.ts` files from `import compression from 'compression'` to `const compression = require('compression')` to avoid `compression.default is not a function` at runtime.

### Article Entity Column Names + TypeORM orderBy Fix (2026-07-18)
`ArticleEntity`, `ArticleCategoryEntity`, `ArticleTagEntity` had missing `{ name: '...' }` on `@Column`, `@CreateDateColumn`, `@UpdateDateColumn`, `@DeleteDateColumn` decorators, causing TypeORM to use camelCase property names while DB has snake_case columns. This triggered `Cannot read properties of undefined (reading 'databaseName')` in TypeORM's paginated query builder (ManyToMany + leftJoinAndSelect + skip/take + orderBy with raw SQL). Fixed by:
- Adding `{ name: 'is_published' }`, `{ name: 'is_featured' }`, `{ name: 'published_at' }`, `{ name: 'image_url' }`, `{ name: 'created_at' }`, `{ name: 'updated_at' }`, `{ name: 'deleted_at' }` to `ArticleEntity`
- Adding `{ name: 'is_active' }`, `{ name: 'sort_order' }`, `{ name: 'created_at' }`, `{ name: 'updated_at' }`, `{ name: 'deleted_at' }` to `ArticleCategoryEntity`
- Adding `{ name: 'created_at' }` to `ArticleTagEntity`
- Changed `orderBy('a.published_at', ...)` to `orderBy('a.publishedAt', ...)` (property path instead of raw SQL) in `ArticlesService.findAll()`

### AssetEntity + Asset Gallery + NestJS 11 FileTypeValidator Fix (2026-07-18)
The Uploads gallery page showed an empty list because standalone uploads (without `entityType`) didn't create any DB record — only S3 storage succeeded. Fixed by:
- Created `AssetEntity` (`libs/database/src/entities/asset.entity.ts`) mapping to new `assets` table (id, url, key, filename, mimeType, size, alt JSONB, timestamps, soft delete).
- Added migration `028_create_assets.sql`.
- Updated `uploadFile()` to always save an `AssetEntity` record regardless of entityType.
- Changed `listAssets()` / `getAsset()` to query from `AssetEntity` instead of `ProductImageEntity`, returning `key`, `filename`, `mimeType`, `size`.
- Updated `deleteFile()` to soft-delete from `AssetEntity` by key.
- Added `skipMagicNumbersValidation: true` to `FileTypeValidator` in uploads controller — NestJS 11's `FileTypeValidator` uses magic number detection (`file-type` ESM package) by default and fails on tiny files without a fallback to mimetype string matching.
- Registered `AssetEntity` in `DatabaseModule` entities list and `libs/database/src/index.ts` exports.
- Updated Admin UI Uploads page (`page.tsx`) — Asset type now expects `key`, `filename`, `mimeType`, `size` fields; delete sends full key instead of parsing from URL.

## GraphQL Compatibility Proxy

The frontend sends all requests as GraphQL to `POST /shop-api`. The `ShopApiModule` (`shop-api/`) intercepts these, parses the operation name, and routes to internal REST services:

- **Location**: `backend/apps/storefront-api/src/shop-api/`
- **Controller**: `POST /shop-api` — accepts `{query, variables}`, returns `{data: {...}}`, sets `vendure-auth-token` header on auth ops
- **Service**: Routes 42 GraphQL operations (19 auth/collections/products + 23 stubs) to existing `AuthService`, `CollectionsService`, `ProductsService`
- **Error handling**: Auth errors returned as typed error unions (`InvalidCredentialsError`, `NotVerifiedError`, etc.) in the response body at HTTP 200
- **Response shaping**: Transforms internal entity shapes into exact GraphQL response shapes (`SearchResult`, `Product`, `CurrentUser`, etc.)

### Operation support level:
- **Auth (11)**: All implemented — Login, Logout, Register, Verify, ResetPassword, UpdatePassword, UpdateCustomer, RequestEmailChange, UpdateEmail, GetActiveCustomer, GetActiveChannel
- **Collections (2)**: All implemented — `GetTopCollections` (tree from CategoryEntity), `GetCollectionProducts` (collection + search)
- **Products (2)**: All implemented — `SearchProducts` (via ProductsService with `ProductCardFragment` shaping), `GetProductDetail` (full with variants/optionGroups/collections)
- **Cart (6)**: All implemented — `GetActiveOrder`, `AddToCart`, `RemoveFromCart`, `AdjustCartItem`, `ApplyPromotionCode`, `RemovePromotionCode` — wired to CartService
- **Checkout (6)**: All implemented — `SetOrderShippingAddress`, `SetOrderBillingAddress`, `SetCustomerForOrder`, `SetOrderShippingMethod`, `TransitionOrderToState`, `AddPaymentToOrder`, plus `GetEligibleShippingMethods`, `GetEligiblePaymentMethods` — wired to CheckoutService
- **Orders (3)**: All implemented — `GetCustomerOrders`, `GetOrderDetail`, `GetOrderByCode` — wired to OrdersService
- **Addresses (4)**: All implemented — `GetCustomerAddresses`, `CreateCustomerAddress`, `UpdateCustomerAddress`, `DeleteCustomerAddress` — direct DB via AddressEntity
- **Countries (1)**: Implemented — `GetAvailableCountries` — direct DB via CountryEntity
- **Channel (1)**: Hardcoded response
- **Articles (4)**: All implemented — `GetArticles`, `GetArticleBySlug`, `GetArticleCategories`, `GetArticleTags` — wired to ArticlesService
- **Total**: 40/44 operations implemented (4 article stubs)

### CountryEntity
Added `CountryEntity` at `libs/database/src/entities/country.entity.ts` — maps to `countries` table (migration 022), has id, code, name (JSONB), phoneCode, isActive, sortOrder. Auto-loaded by TypeORM via `autoLoadEntities: true`. Registered in `libs/database/src/index.ts`.

## Auth Implementation Details

### Storefront Auth (Custom JWT + bcrypt)
- `POST /api/v1/auth/register` — Register new user (password hashed with bcrypt)
- `POST /api/v1/auth/login` — Email/password sign in, returns JWT
- `POST /api/v1/auth/logout` — Clears session (no token param required)
- `POST /api/v1/auth/forgot-password` — Sends reset email
- `POST /api/v1/auth/reset-password` — Token + new password
- `POST /api/v1/auth/change-password` — Requires Bearer token, verifies current password
- `POST /api/v1/auth/change-email` — Requires Bearer token, sends verification
- `GET /api/v1/auth/me` — Requires Bearer token, returns user profile from users table

### Admin Auth (Custom JWT + bcrypt)
- `POST /api/v1/admin/auth/login` — Email/password, returns JWT
- `POST /api/v1/admin/auth/logout` — Requires Bearer token (AdminAuthGuard)
- `GET /api/v1/admin/auth/me` — Requires Bearer token, returns admin profile from JWT payload
- Passwords stored in `admin_users` table with bcrypt hashes
- JWT payload includes `{ sub, email, role }` with configurable expiration (default 8h)
- Roles: super_admin, admin, editor, analyst

### Common Module
- `UserAuthGuard` — Verifies customer JWT via jsonwebtoken from `userJwt` config, attaches `request.user`
- `OptionalUserAuthGuard` — Like UserAuthGuard but doesn't block unauthenticated requests
- `AdminAuthGuard` — Verifies admin JWT via jsonwebtoken, attaches `request.admin`
- `RolesGuard` — Checks `request.admin.role` against required roles from `@Roles()` decorator
- `CurrentUser` decorator — Supports `@CurrentUser()` for `request.user` or `@CurrentUser('admin')` for `request.admin`
- `HttpExceptionFilter` — Global exception filter, wraps all errors in `{ success: false, error: { code, message, details } }` format
- `TransformInterceptor` — Wraps success responses in `{ success: true, data, meta? }` format

## Product Module Details

### Entities (6 entities)
- `ProductEntity` — `products` table (UUID PK, JSONB name/description/meta, slug, sku, base_price, tax_rate, is_active, is_featured, weight, FK to categories + brands, soft delete)
- `ProductVariantEntity` — `product_variants` (JSONB name, unique SKU, `barcode` default '', price, compare_price, tax_rate, weight, is_active, sort_order, soft delete, FK to product; has OneToMany `variantOptions` → ProductVariantOptionEntity, OneToOne inventory)
- `ProductImageEntity` — `product_images` (url, JSONB alt, sort_order, soft delete, FK to product + optional variant)
- `ProductOptionGroupEntity` — `product_option_groups` (JSONB name, sort_order, FK to product, has many options)
- `ProductOptionEntity` — `product_options` (JSONB name + value, sort_order, FK to group)
- `InventoryEntity` — `inventory` (quantity, reserved, low_stock_level, track_inventory, allow_backorder, FK to variant; OneToOne relation to variant)
- `StockHistoryEntity` — `stock_history` (variant_id, type, reason_code, reason, quantity_change, quantity_before, quantity_after, reserved_before, reserved_after, reference, created_by, metadata JSONB, created_at)
- `ProductVariantOptionEntity` — `product_variant_options` (composite PK: variant_id + option_id, ManyToOne to variant and option; join table linking variants to options)

### Storefront Cart Module (apps/storefront-api/src/cart/) — Guest + authenticated carts with merge:
- `GET /api/v1/cart` — Get current cart (auto-creates if not exists). Uses `OptionalAuthGuard` — returns user cart for authenticated users, session cart for guests.
- `POST /api/v1/cart/items` — Add item (variantId or auto-resolves from productId). Validates variant is active, checks stock. Locks unit price from variant at add time. Updates quantity if same variant already in cart.
- `PATCH /api/v1/cart/items/:lineId` — Update item quantity. Removes item if quantity < 1.
- `DELETE /api/v1/cart/items/:lineId` — Remove item.
- `POST /api/v1/cart/coupons` — Apply coupon code to cart (records in `cart_coupons` table).
- `DELETE /api/v1/cart/coupons/:code` — Remove coupon from cart.
- `POST /api/v1/cart/merge` — Merge guest cart into user cart after login. Combines quantities for same variants, moves unique items, marks session cart as `converted`.
- Cart response includes: `items[]` with productName, variantName, sku, image, quantity, unitPrice, lineTotal + `coupons[]` + `totals { subtotal, discountTotal, shippingTotal, taxTotal, grandTotal }`.
- **Entities**: CartEntity (carts), CartItemEntity (cart_items, FK→variants, unitPrice locked), CartCouponEntity (cart_coupons). All 3 tables already exist in migration 007.
- **Stock validation**: Queries InventoryEntity — if `trackInventory=true` and `allowBackorder=false`, rejects if requested qty > available stock.

### Storefront Products Module (apps/storefront-api/src/products/)
- `GET /api/v1/products` — Paginated, filtered (search, categorySlug, brandSlug, isFeatured, minPrice, maxPrice), sorted (created_at, base_price, name, updated_at), includes category/brand/images
- `GET /api/v1/products/featured` — Featured products (optional `limit` query param)
- `GET /api/v1/products/:slug` — Detail with active variants, images (sorted), option groups with options
- `GET /api/v1/products/:slug/variants` — Variants with their variant-specific images + product-level images
- `GET /api/v1/products/:slug/related` — Related products in same category (excludes current, sorted by featured + created)

### Admin Products Module (apps/admin-api/src/products/)
- `GET /api/v1/admin/products` — List with search, categoryId, brandId, isActive, isFeatured, sort, pagination, optional deleted include
- `POST /api/v1/admin/products` — Create (validates slug uniqueness)
- `GET /api/v1/admin/products/:id` — Single with all relations (variants, images, option groups + options)
- `PATCH /api/v1/admin/products/:id` — Update (validates slug, handles all fields)
- `DELETE /api/v1/admin/products/:id` — Soft delete
- `PATCH /api/v1/admin/products/:id/restore` — Restore
- `POST /api/v1/admin/products/:id/variants` — Add variant (validates SKU uniqueness). Accepts optional `barcode`, `optionIds`. Auto-creates inventory. Links options via ProductVariantOptionEntity.
- `PATCH /api/v1/admin/products/:id/variants/:variantId` — Update variant (name, SKU, barcode, price, comparePrice, etc.)
- `DELETE /api/v1/admin/products/:id/variants/:variantId` — Soft delete variant. Also deletes inventory record and variant-option links.
- `GET /api/v1/admin/products/:id/variants/:variantId/options` — Get variant's option assignments with option+group relations
- `PATCH /api/v1/admin/products/:id/variants/:variantId/options` — Assign options (replace all, validates IDs)
- `GET /api/v1/admin/products/:id/variants/:variantId/inventory` — Get variant inventory (existing, nested under products)
- `PATCH /api/v1/admin/products/:id/variants/:variantId/inventory` — Update inventory (existing, nested under products)

### Admin Uploads Module (apps/admin-api/src/uploads/) — S3 file upload with presigned URLs + direct upload + asset gallery:
- `POST /api/v1/admin/uploads/signed-url` — Generate presigned upload URL + public URL + S3 key. Validates content type, extension match, and size limits.
- `POST /api/v1/admin/uploads/confirm` — Confirm upload and link file to entity (creates ProductImageEntity/category image/brand logo).
- `POST /api/v1/admin/uploads/upload` — Direct multipart upload to S3 (10MB max). Always saves to `AssetEntity` for gallery tracking; also links to product/category/brand if `entityType` provided.
- `GET /api/v1/admin/uploads` — Paginated asset listing from `AssetEntity` (search by filename, 48 per page).
- `GET /api/v1/admin/uploads/:id` — Single asset detail.
- `DELETE /api/v1/admin/uploads` — Deletes object from S3, soft-deletes AssetEntity, and optionally removes entity association (ProductImageEntity/category image/brand logo).
- `AssetEntity` — New entity at `libs/database/src/entities/asset.entity.ts`, maps to `assets` table (id, url, key, filename, mimeType, size, alt JSONB, timestamps, soft delete). Created by migration 028.

### Admin Inventory Module (apps/admin-api/src/inventory/)
- `GET /api/v1/admin/inventory/variants/:variantId` — Get inventory with computed available stock
- `POST /api/v1/admin/inventory/variants/:variantId/adjust` — Adjust stock by delta (+/-) with reason code/type, records stock history
- `POST /api/v1/admin/inventory/variants/:variantId/set` — Set stock to absolute value
- `POST /api/v1/admin/inventory/variants/:variantId/reserve` — Reserve stock (validates available)
- `POST /api/v1/admin/inventory/variants/:variantId/release` — Release reserved stock
- `GET /api/v1/admin/inventory/variants/:variantId/history` — Paginated stock history
- `GET /api/v1/admin/inventory/low-stock` — Low stock alerts
- All write operations use DB transactions (QueryRunner) for atomic inventory + history updates.

### Admin Dashboard Module (apps/admin-api/src/dashboard/) — Real DB aggregations:
- `GET /api/v1/admin/dashboard/stats` — Total revenue, orders count, average order value, customers count, products count. Composite query from orders + customers + products tables.
- `GET /api/v1/admin/dashboard/revenue` — Daily revenue for last N days (default 30). Aggregates from orders by `paid_at`.
- `GET /api/v1/admin/dashboard/orders` — Order stats grouped by status (pending, processing, completed, cancelled, etc.).
- `GET /api/v1/admin/dashboard/top-products` — Top products by total quantity sold (limit param). JOINs order_items → product_variants → products.
- `GET /api/v1/admin/dashboard/revenue-summary` — Revenue grouped by day/week/month with period_start, revenue, orders.
- `GET /api/v1/admin/dashboard/order-stats` — Order counts by status with period grouping.
- `GET /api/v1/admin/dashboard/customer-stats` — Total customers, new customers by period.

### Admin Customers Module (apps/admin-api/src/customers/) — Real CRUD:
- `GET /api/v1/admin/customers` — Paginated list with search (email, firstName, lastName, phone), optional soft-deleted include.
- `GET /api/v1/admin/customers/:id` — Single customer detail (from users table).
- `GET /api/v1/admin/customers/:id/orders` — Customer order history with pagination.
- `GET /api/v1/admin/customers/:id/addresses` — Customer addresses (from addresses table).

### Admin Activity Logs Module (apps/admin-api/src/activity-logs/) — Read-only audit trail:
- `GET /api/v1/admin/activity-logs` — Paginated with filters: action, entityType, entityId, userId, date range (startDate/endDate).
- `GET /api/v1/admin/activity-logs/:id` — Single log entry detail.
- `GET /api/v1/admin/activity-logs/distinct-actions` — List of distinct action types in the system.
- `GET /api/v1/admin/activity-logs/distinct-entity-types` — List of distinct entity types.

### Admin Permissions Module (apps/admin-api/src/permissions/) — Role management:
- `GET /api/v1/admin/permissions` — Admin users list with roles (from admin_users table).
- `PATCH /api/v1/admin/permissions/:adminUserId/role` — Update role. Only super_admin can change roles. Role must be valid (super_admin, admin, editor, analyst).

## Brand Module Details

### Entity
- `BrandEntity` in `libs/database/src/entities/` maps to `brands` table (UUID PK, JSONB name/description, slug, logo_url, website_url, is_active, sort_order, timestamps, soft delete)

### Storefront Brands Module (apps/storefront-api/src/brands/)
- `GET /api/v1/brands` — Paginated active brands. Supports `search`, `page`, `limit`, `sort`.
- `GET /api/v1/brands/:slug` — Single active brand.
- `GET /api/v1/brands/:slug/products` — Products by brand (brand_id match). Paginated with search/sort.

### Admin Brands Module (apps/admin-api/src/brands/)
- `GET /api/v1/admin/brands` — Full list with search, isActive filter, sort, pagination, optional soft-deleted include.
- `POST /api/v1/admin/brands` — Create (validates duplicate slug).
- `GET /api/v1/admin/brands/:id` — Single by ID.
- `PATCH /api/v1/admin/brands/:id` — Update (validates slug uniqueness).
- `DELETE /api/v1/admin/brands/:id` — Soft delete (blocks if products exist).
- `PATCH /api/v1/admin/brands/:id/restore` — Restore soft-deleted.
- `PATCH /api/v1/admin/brands/:id/logo` — Update logo URL.
- Role-based: `super_admin` only for delete/restore, `super_admin|admin` for create/update/logo, all roles for read.

## Category Module Details

### Entity
- `CategoryEntity` in `libs/database/src/entities/` maps to `categories` table (UUID PK, parent_id self-ref, JSONB name/description, slug, image_url, is_active, sort_order, timestamps, soft delete)
- Self-referencing parent-child relationship for tree structure
- `autoLoadEntities: true` in DatabaseModule — no manual TypeOrmModule.forRoot entity list needed

### Storefront Collections Module (apps/storefront-api/src/collections/)
- `GET /api/v1/categories` — Paginated tree of active root categories. Builds nested `children` array.
- `GET /api/v1/categories/:slug` — Single active category with `children` and `parent` relations.
- `GET /api/v1/categories/:slug/products` — Products in category tree (recursively includes subcategory product IDs).

### Admin Collections Module (apps/admin-api/src/collections/)
- `GET /api/v1/admin/categories` — Full list with search, parentId filter, isActive filter, sort, pagination, optional soft-deleted include.
- `POST /api/v1/admin/categories` — Create (validates duplicate slug, validates parent exists).
- `GET /api/v1/admin/categories/:id` — Single with parent + children relations.
- `PATCH /api/v1/admin/categories/:id` — Update (validates slug uniqueness, prevents self-parent, validates parent exists).
- `DELETE /api/v1/admin/categories/:id` — Soft delete (blocks if children exist).
- `PATCH /api/v1/admin/categories/:id/restore` — Restore soft-deleted.
- `PATCH /api/v1/admin/categories/sort-order` — Batch reorder via `{ items: [{ id, sortOrder }] }`.
- `POST /api/v1/admin/categories/:id/products` — Assign product to category.
- `DELETE /api/v1/admin/categories/:id/products/:productId` — Unassign product.

## Architecture Documents

| File | Purpose |
|---|---|
| `.ai/architecture.md` | NestJS monorepo structure, module map, request flow |
| `.ai/database.md` | Full database schema (all 32+11 tables, ERD, indexes, FTS, migration summaries) |
| `.ai/api.md` | REST API reference (human-readable) |
| `.ai/openapi.yaml` | OpenAPI 3.0.3 spec (machine-readable) |
| `.ai/decisions.md` | Architecture Decision Records (ADRs) |
| `.ai/memory.md` | This file — project memory |
| `.ai/progress.md` | Progress tracker |
| `.ai/roadmap.md` | 5-phase development roadmap |
| `.ai/tasks.md` | Task list with priorities |

## Important Details to Remember

### Local PostgreSQL (Docker) — Replaced Supabase
- Since 2026-07-17: Database switched from Aiven/Supabase to local Docker PostgreSQL 16.
- `docker-compose.yml` at project root (not `backend/docker/`) runs `postgres:16-alpine` + `minio/minio:latest`.
- All 27 SQL migrations run successfully against local DB (44 tables + seed data).
- `backend/.env` uses `DB_HOST=localhost`, `DB_USERNAME=postgres`, `DB_PASSWORD=postgres`, `DB_SSL=false`.
- `synchronize: false` — all schema changes are manual migrations.

### Supabase PostgreSQL Migration
- Database connection supports two modes:
  1. **DATABASE_URL** (preferred): Single connection string (e.g., `postgresql://user:pass@host:5432/postgres`). Auto-detects supabase.co and enables SSL.
  2. **Individual DB_* vars**: Fallback when DATABASE_URL is not set. Uses DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE.
- SSL: Enabled automatically when `DB_SSL=true`, `NODE_ENV=production`, or URL contains `supabase.co`. Uses `{ rejectUnauthorized: false }`.
- Docker Compose still provides local Postgres for development; set DATABASE_URL to switch to Supabase.
- `.env.example` updated with DATABASE_URL and DB_SSL variables.

### New Entities (added for existing DB tables)
- `AddressEntity` — `addresses` table (customer addresses)
- `DiscountEntity` — `discounts` table (promotion rules)
- `CouponEntity` — `coupons` table (coupon codes)
- `CouponUsageEntity` — `coupon_usages` table (usage tracking)
- `ActivityLogEntity` — `activity_logs` table (audit trail)
- `SettingEntity` — `settings` table (key-value config)

### New Database Tables (Migrations 022–027)
- `countries` (022) — ISO 3166-1 reference data, seeded with VN/US/DE
- `shipping_methods` (023) — Checkout shipping selection, seeded with standard/express
- `payment_methods` (023) — Checkout payment selection, seeded with COD/bank_transfer/momo/vnpay
- `facet_groups`, `facet_values`, `product_facet_values` (025) — Search facet aggregation with seeded size/color/material/sleeve/fit groups
- `articles`, `article_categories`, `article_tags`, `article_category_map`, `article_tag_map` (026) — Blog/content with FTS index
- `product_option_groups.code`, `product_options.code` (027) — ALTER TABLE add code column for URL-based variant selection
- 11 new tables total (7 data + 4 junction), 5 new SQL migration files

### Admin API Role Model
- Roles: `super_admin` (full access), `admin` (CRUD), `editor` (content only), `analyst` (read-only).
- Activity logs and dashboard are read-only; customers and products support full CRUD.
- Permissions module exposes role management (super_admin only).

### Auth Recommendation (Applied 2026-07-25)
- Storefront: Custom JWT (bcrypt) — Supabase Auth removed. Passwords stored in `users` table as `password_hash`.
- Admin: Custom JWT (bcrypt) — unchanged. Credentials in `admin_users` table.
- Both share the same Postgres database with independent auth systems and JWT secrets.


## CI/CD (GitHub Actions + VPS)

| Component | File | Purpose |
|---|---|---|
| CI Pipeline | `.github/workflows/ci.yml` | Lint + typecheck + test + build Docker images → push to GHCR |
| CD Pipeline | `.github/workflows/deploy.yml` | SSH to VPS → pull images → docker compose up |
| Prod Compose | `docker-compose.prod.yml` | Production stack using GHCR images |
| VPS Setup | `.github/scripts/setup-vps.sh` | One-time VPS init (Docker, firewall, SSL, env) |
| Nginx | `nginx/nginx.conf` | Reverse proxy with SSL, rate limiting, gzip |
| Manual Deploy | `deploy.sh` | SSH in and run `./deploy.sh` for manual deploy |

### GitHub Secrets Required
- `VPS_HOST` — VPS IP address
- `VPS_USER` — SSH username (usually `root`)
- `VPS_SSH_KEY` — SSH private key
- `VPS_PORT` — SSH port (optional, default 22)

### Docker Images (GHCR)
- `ghcr.io/{repo}/storefront-api:latest`
- `ghcr.io/{repo}/admin-api:latest`
- `ghcr.io/{repo}/admin-frontend:latest`

### Migration Management
- `scripts/seed-migrations.js` — Marks all SQL files as "applied" in `schema_migrations` table (for existing DBs)
- `scripts/run-migrations.ts` — Smart runner: creates `schema_migrations` table, tracks which files ran, only runs new ones
- `npm run migration:run` — Run pending migrations
- `npm run migration:status` — Show applied vs pending
- Migration 030: `sort_description` column on products + `inquiries` table

## Deployment Model (Updated)

**Manual run on VPS**, Docker chỉ cho DB + Storage:

| Component | Runtime | Port | Start |
|---|---|---|---|
| PostgreSQL | Docker | 127.0.0.1:5432 | `docker compose -f docker-compose.infra.yml up -d` |
| MinIO | Docker | 127.0.0.1:9000 | same |
| Storefront API | PM2 (Node.js) | 127.0.0.1:3000 | `pm2 start ...` |
| Admin API | PM2 (Node.js) | 127.0.0.1:3002 | `pm2 start ...` |
| Storefront UI | PM2 (Next.js) | 127.0.0.1:3001 | `pm2 start npm -- start` |
| Admin UI | PM2 (Next.js) | 127.0.0.1:5002 | `pm2 start npm -- start` |
| Nginx | System | 80, 443 | `systemctl start nginx` |

### Deploy Flow
```
git push → main
  → GitHub Actions CI (lint + test)
  → SSH VPS → deploy.sh
    → git pull → npm ci → nest build → next build → migration:run → pm2 restart
```

### Migration Tracking
- Table `schema_migrations` tracks applied migrations
- `npm run migration:run` — runs pending only
- `npm run migration:status` — shows applied vs pending
- `node scripts/seed-migrations.js` — marks all existing files as applied (for initial setup)

### CI/CD Files
- `.github/workflows/ci.yml` — lint + test
- `.github/workflows/deploy.yml` — SSH → deploy.sh
- `.github/scripts/deploy.sh` — full deploy script
- `.github/scripts/setup-vps.sh` — one-time VPS setup
- `docker-compose.infra.yml` — PostgreSQL + MinIO only
