# Architecture

## System Overview

```
                    ┌──────────────────────┐
                    │   Load Balancer      │
                    │   (nginx / Caddy)    │
                    └──────┬──────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
  ┌──────────────┐  ┌────────────┐  ┌──────────────┐
  │  Next.js     │  │ Storefront │  │  Admin API   │
  │  Storefront  │  │ API        │  │  (NestJS)    │
  │  Port 3001   │  │ (NestJS)   │  │  Port 3002   │
  │              │  │ Port 3000  │  │              │
  └──────────────┘  └─────┬──────┘  └──────┬───────┘
                          │                │
                          └───────┬────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 ▼                ▼                ▼
          ┌────────────┐  ┌────────────┐  ┌────────────┐
          │ Supabase   │  │ Redis      │  │ S3 (MinIO) │
          │ Postgres   │  │ (Future)   │  │            │
          └────────────┘  └────────────┘  └────────────┘
```

## NestJS Monorepo Structure

```
backend/
├── apps/
│   ├── storefront-api/              # NestJS app (port 3000)
│   │   ├── src/
│   │   │   ├── main.ts              # Bootstrap, middleware, pipes
│   │   │   ├── app.module.ts        # Root module
│   │   │   ├── auth/                # Auth module (Supabase JWT)
│   │   │   ├── products/            # Products module
│   │   │   ├── collections/         # Collections module
│   │   │   ├── search/              # Search module
│   │   │   ├── cart/                # Cart module
│   │   │   ├── checkout/            # Checkout module
│   │   │   ├── orders/              # Orders module
│   │   │   ├── account/             # Account module
│   │   │   ├── articles/            # Articles module
│   │   │   ├── pages/               # Content pages module
│   │   │   └── health/              # Health check module
│   │   ├── test/
│   │   └── package.json
│   └── admin-api/                   # NestJS app (port 3002)
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── auth/                # Admin auth (custom JWT)
│       │   ├── products/            # Product CRUD
│       │   ├── collections/         # Collection CRUD
│       │   ├── facets/              # Facet management
│       │   ├── orders/              # Order management
│       │   ├── customers/           # Customer management
│       │   ├── articles/            # Content management
│       │   ├── promotions/          # Promotion management
│       │   ├── shipping/            # Shipping methods
│       │   ├── payment/             # Payment methods
│       │   ├── assets/              # S3 upload/delete
│       │   ├── dashboard/           # Dashboard stats
│       │   └── health/
│       ├── test/
│       └── package.json
├── libs/
│   ├── common/                      # Shared: guards, interceptors, filters, decorators
│   │   ├── guards/
│   │   │   ├── supabase-auth.guard.ts
│   │   │   ├── admin-auth.guard.ts
│   │   │   └── optional-auth.guard.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   ├── logging.interceptor.ts
│   │   │   └── cache.interceptor.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── session-id.decorator.ts
│   │   ├── dto/
│   │   │   ├── pagination-query.dto.ts
│   │   │   └── api-response.dto.ts
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   ├── database/                    # TypeORM entities, migrations, data source
│   │   ├── entities/
│   │   ├── migrations/
│   │   └── data-source.ts
│   └── shared/                      # Shared services: storage, cache, config
│       ├── storage/                 # S3 client service
│       │   └── storage.service.ts
│       ├── cache/                   # Cache abstraction (memory → Redis)
│       │   ├── cache.interface.ts
│       │   ├── memory-cache.service.ts
│       │   └── redis-cache.service.ts
│       └── config/
│           └── app.config.ts
├── docker-compose.yml
├── nest-cli.json
├── tsconfig.json
├── package.json
└── .env.example
```

## NestJS Module Map

Each module contains: controller, service, DTOs, entities (if self-contained).

| Module | Shared Lib? | Purpose |
|---|---|---|
| `auth` | No (per app) | Storefront: Supabase JWT. Admin: custom JWT. |
| `products` | Yes | Product listing, detail, variants, facets |
| `collections` | Yes | Collection tree, collection products |
| `search` | Yes | Full-text search, faceted filters |
| `cart` | Storefront only | Cart CRUD, guest + auth carts |
| `checkout` | Storefront only | Multi-step checkout flow |
| `orders` | Yes | Order history (customer), order management (admin) |
| `account` | Storefront only | Profile, addresses, password, email |
| `articles` | Yes | Blog/articles, categories, tags |
| `pages` | Storefront only | Static content pages |
| `promotions` | Yes | Coupon/promotion management |
| `shipping` | Yes | Shipping methods CRUD |
| `payment` | Yes | Payment methods CRUD |
| `assets` | Admin only | S3 upload/delete via presigned URLs |
| `dashboard` | Admin only | Stats, revenue, top products |
| `health` | Yes | Liveness + readiness probes |

## Request Flow

```
HTTP Request
  → NestJS Middleware (CORS, compression, request ID)
  → Guard (Supabase JWT / Admin JWT / Optional)
  → Interceptor (logging, transform response)
  → Pipe (validation via class-validator)
  → Controller (parse request)
  → Service (business logic)
  → Repository (TypeORM query)
  → Supabase Postgres
  → Interceptor (transform response)
  → JSON Response (consistent format)
```

## Response Envelope

All responses wrapped in consistent format:
```typescript
// Success
{ success: true, data: T, meta?: PaginationMeta }

// Error
{ success: false, error: { code: string, message: string, details?: any } }
```

## Validation Strategy

- **DTOs as classes** with class-validator decorators
- **Global ValidationPipe** with `whitelist: true, forbidNonWhitelisted: true, transform: true`
- **Custom validators** for business rules (slug format, order status transitions, etc.)
- **Request body, query params, path params** all validated
- **TransformPipe** converts primitive types automatically

## Error Handling

- **Global HttpExceptionFilter** catches all exceptions
- **Custom exception classes**: NotFoundException, ValidationException, UnauthorizedException, etc.
- **Consistent error response** with code, message, details
- **No stack traces** in production responses
- **Error logging** with request context (request ID, user ID, IP)

## Rate Limiting

- **@nestjs/throttler** with per-route configuration
- Global: 100 requests/second
- Auth endpoints: 10 requests/minute
- Search: 30 requests/minute
- Cart/Checkout: 20 requests/minute
- **Custom throttler guard** with IP-based tracking

## Caching

Two-tier cache strategy:

```typescript
// Cache interface (libs/shared/cache/cache.interface.ts)
interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl: number): Promise<void>;
  del(key: string): Promise<void>;
  reset(): Promise<void>;
}
```

- **Phase 1**: In-memory LRU cache (lru-cache package)
- **Phase 2**: Redis cache (drop-in replacement implementing same interface)
- **Cache keys**: `product:{slug}`, `collection:{slug}`, `search:{hash}`, `articles:{page}`
- **TTL**: Products 5min, Search 1min, Collections 10min, Articles 15min
- **Cache invalidation**: Manual via admin API endpoint

## Storage (S3)

- **AWS SDK v3** with S3-compatible client (MinIO dev, AWS S3 / Cloudflare R2 production)
- **Presigned URLs** for upload (1hr expiry) and download (24hr expiry)
- **No direct file serving** from NestJS — client uses presigned URLs
- **Asset metadata** stored in database (URL, alt text, sort order)

## Logging

Structured JSON logging via NestJS built-in Logger + custom interceptor:

```json
{
  "timestamp": "2026-07-13T10:30:00.000Z",
  "level": "info",
  "context": "ProductsController",
  "message": "Product fetched",
  "requestId": "uuid",
  "userId": "uuid",
  "method": "GET",
  "path": "/api/v1/products/some-slug",
  "statusCode": 200,
  "duration": 45
}
```

## Middleware Stack

Order of execution in NestJS:
1. **Helmet** — security headers
2. **Compression** — gzip/brotli
3. **CORS** — origin whitelist
4. **Request ID** — UUID per request (X-Request-Id)
5. **Rate Limiting** — ThrottlerGuard
6. **Auth Guard** — Supabase JWT / Admin JWT / Optional
7. **Logging Interceptor** — request/response logging
8. **Transform Interceptor** — wrap response in envelope
9. **Validation Pipe** — DTO validation
10. **Exception Filter** — catch and format errors

## Deployment (Stateless)

- No local file storage
- No in-memory sessions (JWT stateless)
- Environment variables for all config
- Health checks (/health, /ready)
- Graceful shutdown (SIGTERM → NestJS onModuleDestroy hooks)
- Horizontal scaling (multiple container instances)

## Docker

```
docker-compose.yml:
  - postgres (Supabase local or standalone)
  - redis (optional, future)
  - minio (S3 compatible, dev only)
  - storefront-api (NestJS)
  - admin-api (NestJS)
  - nginx (reverse proxy)
```

Each NestJS app has its own Dockerfile (multi-stage build: build → run with node:alpine).
