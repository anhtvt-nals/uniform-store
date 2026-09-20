# Product Related Articles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins select articles manually for each product and render those published selections beneath product detail.

**Architecture:** A simple TypeORM many-to-many relation uses `product_article_map`. The existing admin article listing supplies the picker; the storefront product detail GraphQL contract supplies article-card data only for selected, published articles.

**Tech Stack:** PostgreSQL, TypeORM, NestJS, React/Next.js, gql.tada.

**Spec:** `docs/superpowers/specs/2026-09-17-content-cms-design.md`

## Global Constraints

- This is selection only: no ordering column, recommendation logic, or automatic category matching.
- Article listing/category behavior must not change.
- Storefront exposes only published, non-deleted selected articles.
- Reuse existing `GET /articles?limit=100`; do not create a picker endpoint.

---

### Task 1: Add and manage the selection relation

**Files:**
- Create: `backend/migrations/050_add_product_related_articles.sql`
- Modify: `backend/libs/database/src/entities/product.entity.ts`
- Modify: `backend/libs/database/src/entities/article.entity.ts`
- Modify: `backend/libs/database/src/database.module.ts`
- Modify: `backend/apps/admin-api/src/products/products.module.ts`
- Modify: `backend/apps/admin-api/src/products/dto/create-product.dto.ts`
- Modify: `backend/apps/admin-api/src/products/dto/update-product.dto.ts`
- Modify: `backend/apps/admin-api/src/products/products.service.ts`
- Test: `backend/apps/admin-api/src/products/products.service.spec.ts`

**Interfaces:**
- `CreateProductDto` and `UpdateProductDto` gain `relatedArticleIds?: string[]` validated with `@IsUUID('4', { each: true })`.
- `ProductEntity.relatedArticles` and `ArticleEntity.relatedProducts` represent the relation.

- [ ] **Step 1: Write failing tests for replacement and invalid IDs**

```ts
await service.update('p1', { relatedArticleIds: ['a1', 'a2'] });
expect(mockArticleRepo.findBy).toHaveBeenCalledWith({ id: In(['a1', 'a2']) });
expect(mockProductRepo.save).toHaveBeenCalledWith(expect.objectContaining({ relatedArticles: [{ id: 'a1' }, { id: 'a2' }] }));
```

Add a second test where the repository returns one article for two requested IDs and expect `BadRequestException`.

- [ ] **Step 2: Run the focused test**

Run: `npm test -- --runInBand apps/admin-api/src/products/products.service.spec.ts`

- [ ] **Step 3: Implement migration and TypeORM relation**

```sql
CREATE TABLE product_article_map (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, article_id)
);
CREATE INDEX idx_product_article_map_article_id ON product_article_map(article_id);
```

Use `@ManyToMany` with `@JoinTable({ name: 'product_article_map', ... })` on Product and an inverse relation on Article. Register `ArticleEntity` in the admin product module. Fetch requested articles by ID, reject unknown IDs, and assign the resulting array in create/update before saving.

- [ ] **Step 4: Run tests and admin API build**

Run: `npm test -- --runInBand apps/admin-api/src/products/products.service.spec.ts && npm run build:admin`

### Task 2: Select related articles in admin

**Files:**
- Modify: `admin/src/app/(dashboard)/products/product-form.tsx`

**Interfaces:**
- Consumes `GET /articles?limit=100` response `{ items: Article[] }`.
- Produces `relatedArticleIds: string[]` in the existing product create/update payload.

- [ ] **Step 1: Load available articles with the existing React Query/apiClient pattern**

Request `apiClient('/articles', { token, params: { limit: 100 } })`; initialize selection from `defaultValues.relatedArticles`.

- [ ] **Step 2: Add the picker card**

Use a native `<select multiple>` with article title and slug labels, plus a small count. It supports keyboard selection and needs no custom picker component. Keep it in the product form below SEO.

- [ ] **Step 3: Include IDs on submit and verify the admin build**

Run: `npm run build` in `admin/`.

### Task 3: Return and render selected public articles

**Files:**
- Modify: `backend/apps/storefront-api/src/products/products.module.ts`
- Modify: `backend/apps/storefront-api/src/products/products.service.ts`
- Modify: `backend/apps/storefront-api/src/shop-api/shop-api.service.ts`
- Modify: `storefront/src/lib/vendure/queries.ts`
- Modify: `storefront/src/app/[locale]/product/[slug]/page.tsx`
- Test: `backend/apps/storefront-api/src/products/products.service.spec.ts`

**Interfaces:**
- Product detail GraphQL payload gains `relatedArticles: ArticleCard[]` with `id`, `slug`, `title`, `excerpt`, `publishedAt`, and `featuredAsset`.

- [ ] **Step 1: Write a failing storefront service test**

```ts
expect(await service.findRelatedArticles('uniform-shirt')).toEqual([
  expect.objectContaining({ slug: 'published-article' }),
]);
```

Mock one unpublished and one soft-deleted selected article and assert neither is returned.

- [ ] **Step 2: Implement published-only lookup**

Inject `ArticleEntity`, load the product's related IDs, then query Article with `isPublished: true` and `deletedAt: IsNull()`. Map locale values with the existing `mapArticleCard` convention in `ShopApiService`.

- [ ] **Step 3: Select and render the new payload**

Add `relatedArticles` to `GetProductDetailQuery`, then render a simple article-card section after the product's current content and before `RelatedProducts`. Use existing localized `Link` and image/card styling; render nothing for an empty array.

- [ ] **Step 4: Run verification**

Run: `npm test -- --runInBand apps/storefront-api/src/products/products.service.spec.ts && npm run build:storefront` in `backend/`, then `npm run check-types` in `storefront/`.

- [ ] **Step 5: Commit**

```bash
git add backend/migrations/050_add_product_related_articles.sql backend/libs/database backend/apps/admin-api/src/products backend/apps/storefront-api/src/products backend/apps/storefront-api/src/shop-api admin/src/app/'(dashboard)'/products/product-form.tsx storefront/src
git commit -m "feat: add manually related product articles"
```
