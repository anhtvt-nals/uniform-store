# Rich Content Semantics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Support image captions and explicit new-tab links while proving article headings are not semantically rewritten.

**Architecture:** Configure the installed CKEditor Classic build; keep HTML JSONB and the current direct storefront renderer. Regression tests protect the HTML contract instead of introducing an HTML transform.

**Tech Stack:** CKEditor Classic, React, NestJS Jest, CSS.

**Spec:** `docs/superpowers/specs/2026-09-17-content-cms-design.md`

## Global Constraints

- Do not add an editor dependency or a server-side HTML parser.
- New-tab links require `target="_blank"` and `rel="noopener noreferrer"`.
- Do not change heading CSS unless a semantic regression test identifies a CSS-only issue.

---

### Task 1: Configure the two CKEditor entry points

**Files:**
- Modify: `admin/src/app/(dashboard)/articles/article-form.tsx`
- Modify: `admin/src/app/(dashboard)/products/product-form.tsx`

**Interfaces:**
- Produces HTML with optional `<figure><figcaption>…</figcaption></figure>` and manual decorated `<a>` attributes.

- [ ] **Step 1: Confirm the Classic build exposes image-caption and link-decorator commands in the browser build**

Use the existing dynamic import and inspect `editor.commands.get('toggleImageCaption')` after `onReady`; do not change package versions. If unavailable, stop and report the build limitation before replacing the editor build.

- [ ] **Step 2: Add caption and link controls to the shared inline config**

```ts
image: { toolbar: ['toggleImageCaption', 'imageTextAlternative', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side'] },
link: { decorators: { openInNewTab: { mode: 'manual', label: 'Mở liên kết trong tab mới', attributes: { target: '_blank', rel: 'noopener noreferrer' } } } },
```

Use identical configuration in article and product forms; a helper is not warranted for two short objects unless it becomes necessary to satisfy TypeScript.

- [ ] **Step 3: Manually verify editor output**

Create a captioned image and a decorated link in each form. Confirm `editor.getData()` contains `figcaption`, `_blank`, and `noopener noreferrer`; confirm an undecorated link contains neither target nor rel.

- [ ] **Step 4: Run the admin build**

Run: `npm run build` in `admin/`.

### Task 2: Add renderer contract tests and preserve current styles

**Files:**
- Modify: `backend/apps/storefront-api/src/articles/articles.service.spec.ts`
- Modify: `backend/apps/storefront-api/src/shop-api/shop-api.service.ts` only if tests expose lost fields
- Modify: `storefront/src/app/[locale]/globals.css` only if a visual check proves caption CSS is missing

**Interfaces:**
- Consumes stored HTML string.
- Produces the exact same HTML string in `mapArticleDetail(...).content`.

- [ ] **Step 1: Write a failing mapping regression test**

```ts
const content = '<h2>Heading</h2><figure><img src="/a.jpg"><figcaption>Caption</figcaption></figure><p><a href="/x" target="_blank" rel="noopener noreferrer">X</a></p>';
expect(mapped.content).toBe(content);
expect(mapped.content).toContain('<h2>Heading</h2>');
expect(mapped.content).toContain('<figcaption>Caption</figcaption>');
```

- [ ] **Step 2: Run it and correct only the data mapper if it fails**

Run: `npm test -- --runInBand apps/storefront-api/src/articles/articles.service.spec.ts`

The expected fix is no change because the mapper already forwards content. If it fails, retain HTML verbatim; do not replace tags.

- [ ] **Step 3: Verify both public routes use the contract**

Confirm `/news/[slug]/page.tsx` and `/tin-tuc/[slug]/page.tsx` retain their `dangerouslySetInnerHTML={{ __html: ...content }}` call and that `.article-content figcaption` remains visible.

- [ ] **Step 4: Commit**

```bash
git add admin/src/app/'(dashboard)'/articles/article-form.tsx admin/src/app/'(dashboard)'/products/product-form.tsx backend/apps/storefront-api/src/articles
git commit -m "feat: preserve article captions and link targets"
```
