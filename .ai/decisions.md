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

**Status**: Accepted
**Context**: Need customer auth with email/password, email verification, password reset.
**Decision**: Supabase Auth for customer authentication.
**Rationale**: Built-in email/password auth, JWT sessions, Row Level Security, no password hash storage.
**Consequences**: Customers table references auth.users. Guest checkout uses session_id. Admin auth is separate (custom JWT).

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
**Consequences**: Two Docker containers. Shared code via NestJS library modules.

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

**Status**: Accepted
**Context**: Defense-in-depth for data access.
**Decision**: Enable RLS on customer-facing tables. API uses service_role key.
**Consequences**: Frontend never connects directly to Supabase. RLS is backup.

## ADR-014: S3-Compatible Storage

**Status**: Accepted
**Context**: Need to store product images, article images, user uploads.
**Decision**: S3-compatible storage (MinIO dev, AWS S3/R2 production).
**Rationale**: Stateless deployment, CDN-friendly, presigned URLs.
**Consequences**: No direct file serving. Asset URLs in database.

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
**Context**: Need health checks for Docker orchestration.
**Decision**: @nestjs/terminus for /health and /ready endpoints.
**Consequences**: /health = liveness. /ready = checks DB connection.

## ADR-019: Stateless Container Deployment

**Status**: Accepted
**Context**: Need horizontal scaling.
**Decision**: All state in database or external services. JWT stateless auth.
**Consequences**: No local file storage. No sticky sessions. Easy to scale.
