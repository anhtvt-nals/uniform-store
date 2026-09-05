# Architecture Decision Records

## ADR-001: NestJS Backend

**Status**: Accepted
**Context**: Need a backend framework for the ecommerce API. Frontend is Next.js/TypeScript.
**Decision**: NestJS (TypeScript) with NestJS monorepo mode.
**Rationale**: TypeScript shared with frontend. Modular architecture, built-in DI, decorators for routing/validation/Swagger. Excellent ecosystem (TypeORM, class-validator, @nestjs/swagger). Familiar to frontend developers.
**Consequences**: Two NestJS apps in monorepo. Shared code via NestJS library modules.

## ADR-002: REST over GraphQL

**Status**: Accepted
**Context**: Existing frontend uses Vendure GraphQL. Building custom backend.
**Decision**: REST API.
**Rationale**: Simpler implementation, better HTTP caching, standard OpenAPI docs, no GraphQL client needed on frontend.
**Consequences**: Frontend replaces GraphQL client with REST client.

## ADR-003: Supabase Auth for Customers

**Status**: Superseded
**Context**: Need customer auth with email/password, email verification, password reset.
**Decision**: Supabase Auth was initially selected, then replaced by custom JWT authentication with bcrypt password hashes in `public.users`.
**Rationale**: The storefront and backend own the authentication flow; the application must not modify Supabase-managed `auth` objects.
**Consequences**: `users` does not reference `auth.users`; customer and admin auth use separate custom JWT secrets.

## ADR-004: TypeORM with Migrations

**Status**: Accepted
**Context**: Need ORM that works well with NestJS and PostgreSQL.
**Decision**: TypeORM with migration-based schema management.
**Rationale**: First-class NestJS support. Decorator-based entities. Repository pattern built-in. Migration generation. Good PostgreSQL support.
**Consequences**: Entities as TypeScript classes with decorators. Migrations for schema changes.

## ADR-005: Class-Validator for Input Validation

**Status**: Accepted
**Context**: API inputs need validation with clear error messages.
**Decision**: class-validator + NestJS ValidationPipe.
**Rationale**: Decorator-based validation on DTOs. Rich validation decorators. Custom messages. Works with class-transformer.
**Consequences**: DTOs are classes with validation decorators. Global ValidationPipe in main.ts.

## ADR-006: Swagger/OpenAPI Documentation

**Status**: Accepted
**Context**: API needs documentation for frontend developers.
**Decision**: @nestjs/swagger for automatic OpenAPI documentation.
**Rationale**: Auto-generated Swagger UI. TypeScript types generate OpenAPI schema. Request/response examples.
**Consequences**: Additional decorators on DTOs/controllers. Swagger UI at /api/docs.

## ADR-007: Repository Pattern

**Status**: Accepted
**Context**: Need clean separation between business logic and data access.
**Decision**: Repository pattern via TypeORM repositories.
**Rationale**: Abstracts DB details, testable services, centralized queries, easy to add caching layer.
**Consequences**: More boilerplate, clear separation, easy to unit test.

## ADR-008: Prices in Cents

**Status**: Accepted
**Context**: Monetary values must be precise.
**Decision**: All prices stored as integers (cents).
**Rationale**: No floating-point errors. Standard ecommerce practice. Frontend divides by 100.

## ADR-009: Multi-locale via JSONB

**Status**: Accepted
**Context**: Storefront supports vi, en, de.
**Decision**: Store user-facing text as JSONB with `{en, vi, de}` keys.
**Rationale**: Single row per entity, no translation tables, easy to add locales.
**Consequences**: Application code handles missing locale fallback.

## ADR-010: Separate Storefront and Admin APIs

**Status**: Accepted
**Context**: Public API vs internal admin API have different security requirements.
**Decision**: Two separate NestJS applications in monorepo.
**Rationale**: Security isolation, different auth mechanisms, different rate limits. Admin API on internal network.
**Consequences**: Two independently deployed Node.js processes. Shared code via NestJS library modules.

## ADR-011: Order Code Generation

**Status**: Accepted
**Context**: Orders need human-readable unique codes.
**Decision**: Format `MA-YYYYMMDD-NNNN` via PostgreSQL sequence.
**Rationale**: Human-readable, sequential per day, unique.

## ADR-012: Guest Checkout with Session ID

**Status**: Accepted
**Context**: Allow purchases without account.
**Decision**: session_id (UUID in cookie) for guest cart association.
**Consequences**: cart_items nullable customer_id + session_id with constraint.

## ADR-013: Row Level Security

**Status**: Superseded
**Context**: Defense-in-depth for data access.
**Decision**: Authorization is enforced in NestJS guards and services; Supabase Auth-dependent RLS policies are not installed.
**Rationale**: The storefront never connects to Supabase directly and authentication uses custom JWTs, so `auth.uid()` policies are invalid.
**Consequences**: Database access is restricted to backend credentials. API authorization must remain server-side.

## ADR-014: S3-Compatible Storage

**Status**: Accepted
**Context**: Need to store product images, article images, user uploads.
**Decision**: Cloudflare R2 through its S3-compatible API in every environment.
**Rationale**: Stateless deployment, CDN-friendly public custom domains, presigned URLs, and no storage service to operate on the VPS.
**Consequences**: No direct file serving. Asset URLs in database; runtime requires `R2_*` credentials.

## ADR-015: Cache Abstraction Layer

**Status**: Accepted
**Context**: Need caching but want to avoid Redis dependency from day one.
**Decision**: In-memory LRU cache initially. Interface ready for Redis swap.
**Consequences**: CacheService interface. In-memory first, Redis later.

## ADR-016: Rate Limiting (@nestjs/throttler)

**Status**: Accepted
**Context**: Protect APIs from abuse.
**Decision**: @nestjs/throttler with per-route configuration.
**Rationale**: NestJS-native solution, TTL + limit per route, IP-based tracking.
**Consequences**: Global: 100/s. Auth: 10/min. Search: 30/min. Cart: 20/min.

## ADR-017: Structured JSON Logging

**Status**: Accepted
**Context**: Need observability for debugging and monitoring.
**Decision**: Structured JSON logging via NestJS Logger + custom interceptor.
**Rationale**: Machine-readable, request tracing, parseable.

## ADR-018: Health Check Endpoints

**Status**: Accepted
**Context**: Need health checks for managed deployment monitoring.
**Decision**: @nestjs/terminus for /health and /ready endpoints.
**Consequences**: /health = liveness. /ready = checks DB connection.

## ADR-019: Stateless Container Deployment

**Status**: Accepted
**Context**: Need horizontal scaling without self-hosting infrastructure.
**Decision**: All state is held in Supabase PostgreSQL or Cloudflare R2. Applications run as stateless Node.js/PM2 processes.
**Consequences**: No Docker, local database, or local file storage. No sticky sessions. Easy to scale.

## ADR-020: Homepage Category Showcase Data

**Status**: Accepted
**Context**: The homepage category showcase needs each category's localized description and thumbnail, in addition to its existing name and slug.
**Decision**: Extend the existing `GetTopCollections` GraphQL compatibility response with `description` and `featuredAsset`; retain its existing fields and data source.
**Rationale**: Category descriptions and images are already managed catalog data. Returning them with the existing collection query avoids duplicated frontend content and keeps the storefront contract backward compatible.
**Consequences**: Collection consumers may request these optional fields; the proxy maps them from `categories.description` and `categories.image_url`.

## ADR-021: Homepage Testimonials API

**Status**: Accepted
**Context**: Homepage testimonials must be managed by administrators instead of being embedded in storefront translations.
**Decision**: Store testimonials in the database and expose only active, ordered records through `GET /api/v1/testimonials?locale=vi`; protect CRUD operations behind the admin API at `/api/v1/admin/testimonials`.

## ADR-022: Product Popularity Ordering for Homepage Lists

**Status**: Accepted
**Context**: Homepage category lists need real best-seller ordering that staff can curate without maintaining a separate homepage catalog.
**Decision**: Add `products.sold_count` and `products.display_order`, editable from the product form. When no explicit storefront sort is requested, products are ordered by descending display priority, then sold count, then creation time. The homepage-specific `HomepageCategoryProducts` GraphQL compatibility operation selects up to two products from each category in the selected parent tree before filling its 10 remaining slots by ranking. The mapper includes `soldCount` alongside its existing extra storefront fields so product cards can show the administrator-managed total.
**Rationale**: Product already owns the merchandising metadata. Extending the existing search response preserves the frontend's compatibility endpoint and avoids duplicate lists or a separate ranking API.
**Rationale**: This retains the storefront's exact card data shape while letting admins update copy, avatar, rating, ordering, and visibility without deployment.
**Consequences**: Migration `041_create_testimonials.sql` is required. The storefront keeps its existing translated reviews only as a graceful fallback when the public API is unavailable.

## ADR-022: Vietnamese Article Tags from Admin

**Status**: Accepted
**Context**: The Vietnamese-only Article editor needs a simple tag input while the database stores tags as reusable many-to-many entities.
**Decision**: The Admin Article create and update payload accepts an optional `tagNames: string[]`. The service normalizes the labels, reuses matching Vietnamese tags, creates missing tags, and persists the resulting relation.
**Rationale**: It matches the editor's comma-separated tag input and keeps tags reusable without exposing backend-only IDs in the form.
**Consequences**: `GET /api/v1/admin/articles` and `GET /api/v1/admin/articles/:id` include each article's tag records so the editor can repopulate its input.

## ADR-023: Direct Cart Order for Sales Follow-up

**Status**: Accepted
**Context**: The storefront is Vietnamese-only and orders are finalized by the sales team after contacting the customer; a multi-step self-service checkout is unnecessary.
**Decision**: `POST /api/v1/orders/quote` creates an order directly from the active user or guest cart using the contact form data. It stores contact data in the order address fields and product requirements in `orders.notes`, then clears the cart in the existing order transaction.
**Consequences**: The cart submits directly to order confirmation, Admin manages follow-up in Orders, and the former client redirect to `/checkout` is not used from the cart CTA.

## ADR-024: BIGINT for VND Monetary Values

**Status**: Accepted
**Context**: Catalog prices and order totals are stored directly in VND. B2B order totals and order-line totals can exceed PostgreSQL `INTEGER`'s 2,147,483,647 limit.
**Decision**: Persist all monetary columns as PostgreSQL `BIGINT`; migration `042_expand_vnd_money_columns.sql` converts catalog, cart, discount, shipping, order, order-payment, and order-item monetary values.
**Rationale**: `BIGINT` safely supports practical VND values while retaining exact whole-currency arithmetic.
**Consequences**: Database drivers may return a `BIGINT` as a string; storefront GraphQL order mappers explicitly convert money fields to numbers before responding.

## ADR-025: Public Order Lookup Requires Email and Code

**Status**: Accepted
**Context**: Customer accounts are not part of the normal ordering workflow, but customers need to check an order after sales follow-up submission.
**Decision**: Replace the account order-list entry point with `/tra-cuu-don-hang`. The page calls `GET /api/v1/orders/lookup?email=&code=`; the backend returns a minimal order-detail response only when both values match.
**Rationale**: Email plus the generated order code lets customers self-serve without a login while preventing a code alone from exposing order data.
**Consequences**: The former account-order navigation is removed; legacy account-order URLs should redirect to the lookup page.

## ADR-026: Product-Scoped Promotion Rules

**Status**: Accepted
**Context**: Admin needs simple, business-oriented promotions without the legacy coupon-first interface.
**Decision**: A promotion has one Vietnamese title, a percentage or fixed-VND value, selected product IDs, an optional expiration date, and a minimum quantity required for each eligible product. The minimum is persisted as `discounts.min_quantity_per_product`.
**Rationale**: The model maps directly to common uniform-order promotions such as "giảm 10% khi mua từ 20 áo của cùng mẫu".
**Consequences**: Migration `043_add_discount_product_quantity_condition.sql` is required. The existing coupon tables remain for backwards compatibility but are not part of the new Admin workflow.

## ADR-027: Catalog-Based Hero Price Estimate

**Status**: Accepted
**Context**: The Hero configurator must not display a fabricated price range.
**Decision**: `GET /api/v1/products/price-estimate?categorySlug=&quantity=` calculates the min/max from active product variants in the selected category, then applies eligible active product discounts that have not expired and whose per-product quantity condition is met.
**Rationale**: The CTA communicates a truthful catalog-based reference price while retaining the quote flow for printing, embroidery and custom-manufacturing costs.
**Consequences**: The UI displays a contact prompt when a category has no active catalog price; it does not invent a fallback amount.

## ADR-028: Guest Contact Upsert

**Status**: Accepted
**Context**: Admin needs order and quote contacts to appear in Customers even when the buyer has not registered.
**Decision**: Order and quote submission normalizes email/phone and upserts a `users` contact record, updating name and phone if an existing email or phone is found. Orders link the resulting customer ID when available.
**Consequences**: An email is required to create a brand-new customer because `users.email` is unique; phone-only submissions remain stored in their order/quote but cannot create a separate user record.

## ADR-029: Direct R2 Multipart Uploads for Large Admin Images

**Status**: Accepted
**Context**: Sending images larger than 5 MB through the Admin API is slower and needlessly consumes VPS bandwidth. Nginx also rejects oversized proxied request bodies before the API can process them.
**Decision**: Files above 5 MB and up to the existing 10 MB image limit use the R2 S3 multipart protocol. The Admin API validates metadata, initiates the upload and signs every part; the browser uploads parts directly to R2 in parallel, submits their ETags for completion, then the API persists the normal asset/entity association. Smaller files retain the existing API form upload.
**Consequences**: The R2 bucket CORS policy must allow the Admin origin to `PUT` and expose the `ETag` response header. The browser never receives R2 credentials, and failed multipart uploads are explicitly aborted.
# Product size contract (2026-08-26)

Product size is a shared catalog record (`sizes`) assigned many-to-many to products. Public `GET /api/v1/products/:slug` now includes active `sizes` and `sizeGuideImageUrl`; `POST /api/v1/cart/items` accepts optional `sizeId` and requires it when a product has configured sizes. The Shop API's existing add-to-cart mutation also forwards an optional `sizeId` request variable, preserving compatibility with the legacy Vendure GraphQL schema. Cart and order line responses preserve `sizeName` as a historical snapshot. The storefront's legacy Vendure-compatible GraphQL product shape cannot safely add custom fields, so size metadata is loaded from the existing REST product-detail endpoint.
