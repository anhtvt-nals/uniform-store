# Asset Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store library-only image caption, alt text, destination link, and title metadata, then snapshot it on editor insertion.

**Architecture:** Extend `AssetEntity` and the active `uploads` module. The admin uploads page edits asset metadata; CKEditor insertion receives a one-time HTML snapshot and never back-propagates later library edits.

**Tech Stack:** PostgreSQL, TypeORM, NestJS/class-validator, React/Next.js, CKEditor.

**Spec:** `docs/superpowers/specs/2026-09-17-content-cms-design.md`

## Global Constraints

- Metadata is library-only; existing article/product HTML is never rewritten.
- Reuse `UploadsModule`; do not use the unused `assets` stub module.
- Keep `alt`, `caption`, and `title` localized JSONB; `linkUrl` is a string.

---

### Task 1: Add metadata persistence and API

**Files:**
- Create: `backend/apps/admin-api/src/uploads/dto/update-asset.dto.ts`
- Create: `backend/migrations/049_add_asset_metadata.sql`
- Modify: `backend/libs/database/src/entities/asset.entity.ts`
- Modify: `backend/apps/admin-api/src/uploads/uploads.controller.ts`
- Modify: `backend/apps/admin-api/src/uploads/uploads.service.ts`
- Modify: `backend/apps/admin-api/src/uploads/uploads.service.spec.ts`

**Interfaces:**
- Produces `PATCH /uploads/:id` accepting `{ alt?, caption?, title?, linkUrl? }`.
- Returns the existing asset shape plus `caption`, `title`, and `linkUrl` from list/detail/upload responses.

- [ ] **Step 1: Write failing update tests**

```ts
mockAssetRepo.findOne.mockResolvedValue({ id: 'a1', alt: {} });
mockAssetRepo.save.mockImplementation(async (asset) => asset);
await expect(service.updateAsset('a1', { caption: { vi: 'Chú thích' }, linkUrl: '/news/x' }))
  .resolves.toMatchObject({ caption: { vi: 'Chú thích' }, linkUrl: '/news/x' });
```

- [ ] **Step 2: Run the test**

Run: `npm test -- --runInBand apps/admin-api/src/uploads/uploads.service.spec.ts`

- [ ] **Step 3: Implement migration/entity/DTO/service/controller**

```sql
ALTER TABLE assets
  ADD COLUMN caption JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN title JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN link_url TEXT NOT NULL DEFAULT '';
```

`updateAsset` must throw `NotFoundException` for an unknown asset and only assign properties explicitly supplied by the DTO. Add `@Patch(':id')` with the existing admin/auth role guards inherited from the controller.

- [ ] **Step 4: Run tests and backend build**

Run: `npm test -- --runInBand apps/admin-api/src/uploads/uploads.service.spec.ts && npm run build:admin`

### Task 2: Edit library metadata and snapshot it into content

**Files:**
- Modify: `admin/src/app/(dashboard)/uploads/page.tsx`
- Modify: `admin/src/components/shared/asset-picker.tsx`
- Modify: `admin/src/app/(dashboard)/articles/article-form.tsx`
- Modify: `admin/src/app/(dashboard)/products/product-form.tsx`

**Interfaces:**
- `AssetPicker.onSelect` changes from `(url: string) => void` to `(asset: Asset) => void`.
- Article and product forms each get an explicit “Chèn từ tài nguyên” button beside CKEditor; its picker selection receives `{ url, alt, caption, title, linkUrl }` and writes snapshot HTML.

- [ ] **Step 1: Add metadata editing to the uploads page**

Use the existing selected/delete dialog pattern and `apiClient('/uploads/:id', { method: 'PATCH' })`. The form fields are: Vietnamese alt, caption, title, and destination URL. Invalidate `['assets']` after success.

- [ ] **Step 2: Return complete assets from AssetPicker and open it from the editor**

Extend its local `Asset` type and pass the selected object, not only URL. Existing thumbnail callers adapt by reading `asset.url`. In each rich-content form, add a local `contentAssetPickerOpen` state and a button next to the CKEditor that opens a second `AssetPicker`; do not overload the thumbnail picker state.

- [ ] **Step 3: Insert a snapshot in CKEditor**

At selection time construct the smallest valid HTML: image with escaped `src`, `alt`, and `title`; wrap it in an anchor only for a non-empty link URL; wrap in `figure` and add `figcaption` only for a non-empty caption. Insert through CKEditor's model/data API at the current selection, then confirm future asset edits cannot affect saved article HTML. Reject `javascript:` and `data:` link URLs before insertion; asset URLs originate from the authenticated library API.

- [ ] **Step 4: Verify**

Run: `npm run build` in `admin/`. Manually insert an asset, alter the library caption, reload the article, and confirm its stored caption is unchanged.

- [ ] **Step 5: Commit**

```bash
git add backend/migrations/049_add_asset_metadata.sql backend/libs/database/src/entities/asset.entity.ts backend/apps/admin-api/src/uploads admin/src
git commit -m "feat: add asset library metadata"
```
