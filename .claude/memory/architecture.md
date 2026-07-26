# Architecture

Last verified against source: 2026-07-26 (HEAD `dc2faa6`).

## 1. Runtime topology

Four Node processes plus two infrastructure containers.

```
                          nginx (80/443, system service on VPS)
                                     │
        ┌────────────────────────────┼──────────────────────────────┐
        │                            │                              │
  yourdomain.com            admin.yourdomain.com          storage.yourdomain.com
        │                            │                              │
        ▼                            ▼                              ▼
┌────────────────┐   ┌────────────────────────────────┐    ┌────────────────┐
│ Storefront UI  │   │ Admin UI :5002  │ Admin API    │    │ MinIO :9000    │
│ Next.js :3001  │   │ (Next.js)       │ NestJS :3002 │    │ (Docker)       │
└───────┬────────┘   └─────────────────┴──────┬───────┘    └────────────────┘
        │ POST /shop-api (GraphQL)            │
        │ + a few REST proxies                │
        ▼                                     │
┌────────────────────┐                        │
│ Storefront API     │                        │
│ NestJS :3000       │                        │
└─────────┬──────────┘                        │
          └───────────────┬───────────────────┘
                          ▼
                 PostgreSQL 16 :5432 (Docker)
```

In production both APIs and both Next apps run under **PM2 directly on the host**;
only Postgres and MinIO are containerised (`docker-compose.infra.yml`, ports bound to
`127.0.0.1`). `docker-compose.yml` at the root is the *local/dev* full-stack variant and
still builds Docker images for the APIs — it is not what production uses.

PM2 process names: `uniform-storefront-api`, `uniform-admin-api`, `uniform-storefront`,
`uniform-admin`.

## 2. Backend — NestJS monorepo

`backend/nest-cli.json` defines 5 projects: 2 applications + 3 libraries. Build output
lands in `backend/dist/apps/<name>/main.js`.

`webpack: true` is enabled, with `backend/webpack.config.js` marking `@nestjs/typeorm`
and `typeorm` as externals — this exists to break a circular-bundle failure. Do not
remove those externals casually.

### Bootstrap (both apps, `main.ts`)

Identical pipeline in both apps:

1. `enableCors` — reads `process.env.CORS_ORIGIN` (**singular**), falls back to `*`.
   Note the env templates document `CORS_ORIGINS` (plural) and `app.config.ts` parses
   `CORS_ORIGINS` — the two are not wired together. See bugs.md.
2. `helmet()`, `compression()` — compression is `require`d, not imported, because it is
   CJS and the ESM interop default breaks at runtime.
3. Global `ValidationPipe`: `whitelist`, `forbidNonWhitelisted`, `transform`,
   `enableImplicitConversion`.
4. Global `HttpExceptionFilter` → `{ success: false, error: {...} }`.
5. Global `TransformInterceptor` → `{ success: true, data, meta? }`.
6. Global `StorageUrlInterceptor` (resolved from the DI container) → rewrites storage
   keys into absolute URLs on the way out. See §6.
7. Swagger at `/api/docs` (storefront) and `/api/v1/admin/api/docs` (admin).

**Route prefixes differ between the two apps:**

| App | Global prefix | Controller declares |
|---|---|---|
| storefront-api | *none* | `@Controller('api/v1/products')` etc. — full path inline |
| admin-api | `api/v1/admin` (`ADMIN_API_PREFIX`) | `@Controller('products')` — prefix prepended |

Storefront root-level routes that are *not* under `api/v1`: `GET /health`, `GET /ready`,
`POST /shop-api`.

### Storefront API modules (`apps/storefront-api/src/`)

`auth`, `products`, `collections`, `brands`, `search`, `cart`, `checkout`, `orders`,
`account`, `articles`, `pages`, `inquiries`, `quote-requests`, `customer-contracts`,
`shop-api`, `health`.

`pages` is a grab-bag serving `GET /api/v1/banners`, `/settings/public`, `/countries`,
`/channel`.

### Admin API modules (`apps/admin-api/src/`)

`auth`, `products`, `collections`, `brands`, `facets`, `orders`, `customers`, `articles`,
`promotions`, `shipping`, `payment`, `uploads`, `dashboard`, `inventory`,
`activity-logs`, `permissions`, `inquiries`, `settings`, `quote-requests`,
`customer-contracts`, `health`.

### Shared libraries

**`libs/common`** — cross-cutting HTTP concerns.
- Guards: `UserAuthGuard`, `OptionalUserAuthGuard`, `AdminAuthGuard`, `RolesGuard`.
- Interceptors: `TransformInterceptor`, `LoggingInterceptor`, `CacheInterceptor`.
- Filter: `HttpExceptionFilter`.
- Decorators: `@CurrentUser()` (also `@CurrentUser('admin')`), `@SessionId()`, `@Roles()`.
- DTOs: `PaginationQueryDto`, `PaginationResponseDto`, `ApiResponseDto`.

**`libs/database`** — 37 TypeORM entities, `DatabaseModule`, `data-source.ts` (CLI only).
`DatabaseModule` lists entities **explicitly** (no `autoLoadEntities`), so a new entity
must be registered in three places: the entity file, `entities/index.ts`, and the array
in `database.module.ts`.

Connection resolution (same logic in `database.module.ts` and `data-source.ts`):
`DATABASE_URL` if set, otherwise the individual `DB_HOST`/`DB_PORT`/`DB_USERNAME`/
`DB_PASSWORD`/`DB_DATABASE` vars. SSL is on **only** when `DB_SSL=true`
(`{ rejectUnauthorized: false }`); there is no longer any automatic SSL inference.

**`libs/shared`** — `StorageService` (S3), `MemoryCacheService` / `RedisCacheService`
behind `cache.interface.ts`, `MailService` (nodemailer), `StorageUrlInterceptor`, and
`config/app.config.ts`.

`app.config.ts` is registered as `registerAs('app', ...)`, so **every lookup needs the
`app.` prefix**: `configService.get('app.storage')`, not `configService.get('storage')`.
This has bitten the project before.

## 3. Data model

37 entities over ~44 tables. Full schema and ERD live in `.ai/database.md`.

**Catalog** — `ProductEntity`, `ProductVariantEntity`, `ProductImageEntity`,
`ProductOptionGroupEntity`, `ProductOptionEntity`, `ProductVariantOptionEntity`
(composite-PK join), `CategoryEntity` (self-referencing tree), `BrandEntity`,
`AssetEntity`.

**Inventory** — `InventoryEntity` (1:1 with variant: `quantity`, `reserved`,
`lowStockLevel`, `trackInventory`, `allowBackorder`) and `StockHistoryEntity`
(append-only audit trail; every write goes through a `QueryRunner` transaction that
updates inventory and appends history atomically).

**Cart** — `CartEntity`, `CartItemEntity`, `CartCouponEntity`. Guest carts key off a
`session_id`; user carts off `customer_id`. `POST /api/v1/cart/merge` folds the guest
cart into the user cart after login and marks the session cart `converted`. Unit price
is **locked onto the cart item at add time**, not read live from the variant.

**Orders** — `OrderEntity`, `OrderItemEntity`, `OrderAddressEntity`,
`OrderPaymentEntity`, `OrderDiscountEntity`, `OrderStatusHistoryEntity`.
Order codes are generated **in the database**: a Postgres trigger + `order_code_seq`
sequence produces `MA-YYYYMMDD-NNNN` (migration `008`). Do not generate codes in app code.

**Identity** — `UserEntity` (customers, `password_hash`), `RoleEntity`, `UserRoleEntity`,
`AdminUserEntity` (admins, separate table + separate bcrypt hash), `AddressEntity`.

**Promotions** — `DiscountEntity`, `CouponEntity`, `CouponUsageEntity`.

**Content** — `ArticleEntity`, `ArticleCategoryEntity`, `ArticleTagEntity` (+ two
many-to-many map tables), `SettingEntity` (key/value config), `ActivityLogEntity`,
`CountryEntity`.

**B2B lead capture** — this is the business core, see §7:
`QuoteRequestEntity`, `InquiryEntity`, `CustomerContractEntity`.

Migrations `010`–`012` create `reviews`, `wishlists` and `banners` tables that have **no
entities and no code behind them**. They are schema-only placeholders.

## 4. Auth

Two fully independent systems sharing one database.

**Customer** — `POST /api/v1/auth/register|login|logout|forgot-password|reset-password|
change-password|change-email`, `GET /api/v1/auth/me`.
bcrypt hash in `users.password_hash`; JWT signed with `app.userJwt.secret`
(`USER_JWT_SECRET`, falling back to `JWT_SECRET`), default TTL **30d**.
Verified by `UserAuthGuard` → attaches `request.user`. `OptionalUserAuthGuard` lets
anonymous requests through (used by cart, so guests get a session cart).

**Admin** — `POST /api/v1/admin/auth/login|logout|refresh`, `GET /api/v1/admin/auth/me`.
bcrypt hash in `admin_users`; JWT signed with `app.adminJwt.secret`
(`ADMIN_JWT_SECRET`), default TTL **8h**. Payload `{ sub, email, role }`.
Verified by `AdminAuthGuard` → attaches `request.admin`.

Roles, enforced by `RolesGuard` + `@Roles()`:
`super_admin` (everything, only role that can change roles) > `admin` (CRUD) >
`editor` (content) > `analyst` (read-only).

Storefront token transport: returned in the `vendure-auth-token` response header, stored
in the `vendure-auth-token` cookie (`storefront/src/lib/auth.ts`), replayed as
`Authorization: Bearer`. Admin token transport: JSON body → localStorage →
`Authorization: Bearer`, with a single-flight refresh in `admin/src/lib/api.ts`.

## 5. Request flows

**Storefront read (product page)**

```
Server Component
  → src/lib/vendure/cached.ts  (Next cache tags)
    → src/lib/vendure/api.ts   query()  — GraphQL document, gql.tada typed
      → POST /shop-api  { query, variables }   [+ languageCode / currencyCode in URL]
        → ShopApiController → ShopApiService
          → operation-name dispatch → ProductsService (plain NestJS service)
            → TypeORM → Postgres
          ← reshaped into the Vendure response shape
      ← { data: { ... } }
```

**Storefront mutation** — server action (`'use server'`) → same path → then
`updateTag('cart')` / `revalidatePath()`. Cache tags are `{tag}-{locale}` for
locale-only data and `{tag}-{locale}-{currency}` for priced data. There is a
`POST /api/revalidate` webhook guarded by `REVALIDATION_SECRET`.

**Storefront lead capture** — bypasses GraphQL. Client form → Next route handler in
`src/app/api/v1/<resource>/route.ts` → plain REST `POST` to the backend. Used by
quote-requests, inquiries, customer-contracts, public settings.

**Admin** — client component → react-query → `apiClient()` → `NEXT_PUBLIC_ADMIN_API_URL`
(`http://host:3002/api/v1/admin`) → admin-api. The admin UI calls the backend **directly
from the browser**, so CORS and the public reachability of port 3002 matter.

## 6. Storage and the key-vs-URL contract

S3-compatible object storage (MinIO in dev and on the VPS; AWS S3 / R2 also supported).
`StorageService` wraps AWS SDK v3 with `forcePathStyle: true` and offers upload, delete,
presigned upload URL, presigned download URL, and `buildPublicUrl(key)`.

**As of commit `084f8e9` the database is supposed to store bare object keys, not URLs.**
`StorageUrlInterceptor` runs on every response, walks the payload, and for any field
named `url`, `imageUrl`, `image_url`, `logoUrl`, `logo_url`, `previewUrl`, `preview_url`,
`preview`, `thumbnailUrl` or `thumbnail_url`, it prefixes
`STORAGE_PUBLIC_URL` — *unless* the value already starts with `http://` or `https://`,
in which case it is passed through untouched.

Point of the design: the storage domain can change with an env var and no data migration.

Caveat: the migration that was supposed to strip existing URLs down to keys (`037`) does
not run — see bugs.md. The pass-through branch is what keeps old rows working.

Upload paths: admin can either take a presigned URL (`POST /uploads/signed-url` then
`/uploads/confirm`) or push a multipart file straight through the API
(`POST /uploads/upload`, 10 MB cap). Both always write an `AssetEntity` row so the
gallery at `GET /api/v1/admin/uploads` sees it; entity linking (product image, category
image, brand logo) is optional on top.

## 7. Business logic worth knowing

**The commerce funnel is secondary to the quote funnel.** This is a manufacturing B2B
site: visitors are companies ordering bulk custom uniforms. Cart/checkout/orders exist
and work, but the homepage, navbar CTA and mobile sticky bar all drive to *"Nhận báo giá
miễn phí"* (get a free quote).

- **`quote_requests`** — the main lead object. `customerName`, `phone`, `email`,
  `region`, `address`, `productType`, `quantity`, `source`, plus a sales workflow:
  `status` (default `NEW`) and `salesNote`. No FK to products or users — a quote is a
  cold lead, not an order. Submitted anonymously from the storefront, worked in the
  admin under `/quotes`.
- **`inquiries`** — product-scoped interest. FK to `product_id`, plus `fullName`,
  `email`, `phone`, `company`, `quantity`, `notes`, `status` (default `pending`).
  This is "ask about *this* product" as opposed to a general quote.
- **`customer_contracts`** — social proof. Client name, logo, a scan of the signed
  contract, `displayOrder`, `isActive`. Rendered as the homepage trust bar / case
  studies. Ordering and visibility are editorial, controlled from the admin.

**Pricing** — all money is integer cents. Products carry `base_price` and `tax_rate`;
variants can override price and `compare_price`. The homepage additionally shows a
static tiered pricing table (marketing content, not from the DB).

**Stock** — a cart add is rejected when `trackInventory = true`, `allowBackorder = false`
and the requested quantity exceeds `quantity - reserved`. Otherwise it passes.

**Localisation** — `vi`, `en`, `de`; `defaultLocale` is `en` and the locale prefix is
always present in storefront URLs. Backend user-facing strings are JSONB objects keyed by
locale; `languageCode` arrives as a query param on `/shop-api` and the resolution is
`value?.[locale] ?? value?.en ?? ''`.

## 8. Configuration

Env is read in three unrelated places, which is a live source of confusion:
- `backend/libs/shared/src/config/app.config.ts` — the typed `app.*` namespace.
- `main.ts` and `database.module.ts` — raw `process.env` reads, bypassing the config module.
- `.env.example` at the repo root (VPS-shaped) vs `backend/.env.example` (dev-shaped).
  They disagree, and the backend one still documents removed Supabase variables.

Keys that actually matter: `DATABASE_URL` *or* `DB_*`, `DB_SSL`, `JWT_SECRET` /
`USER_JWT_SECRET`, `ADMIN_JWT_SECRET`, `STORAGE_ENDPOINT` / `STORAGE_ACCESS_KEY` /
`STORAGE_SECRET_KEY` / `STORAGE_BUCKET` / `STORAGE_PUBLIC_URL`, `CORS_ORIGIN(S)`,
`SMTP_*` / `MAIL_FROM` / `SALES_EMAIL`, and on the frontends
`VENDURE_SHOP_API_URL` / `NEXT_PUBLIC_ADMIN_API_URL`.

## 9. CI/CD

- `.github/workflows/ci.yml` — matrix over `backend | storefront | admin`, runs
  `npm ci` then `npx tsc --noEmit`. The backend test job is commented out.
- `.github/workflows/deploy.yml` — triggers on CI success on `main`, SSHes to the VPS
  and runs `.github/scripts/deploy.sh`.
- `.github/scripts/deploy.sh` — `git fetch && git reset --hard origin/main && git clean -fd`,
  `npm ci --workspaces`, `nest build` ×2, `next build` ×2, migrations, then
  `pm2 delete` + `pm2 start` for all four services, `pm2 save`.
  The reset is **destructive**: anything uncommitted on the VPS is discarded.
  Frontend builds and migrations are wrapped in `|| echo "continuing"` — failures there
  do not fail the deploy.
- `.github/scripts/setup-vps.sh` — one-time host provisioning (Node 22, PM2, Docker,
  nginx, UFW, first build, nginx config).
- Setup walkthrough (in Vietnamese): `setup.md`. Longer deploy notes: `DEPLOY.md`.
