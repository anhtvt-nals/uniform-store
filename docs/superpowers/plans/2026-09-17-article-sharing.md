# Article Sharing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Facebook and X sharing links to public article detail pages.

**Architecture:** Server-render ordinary external anchors from the existing canonical URL and article title. No client state, SDK, OAuth, or backend API is needed.

**Tech Stack:** Next.js server components, existing Lucide icons.

**Spec:** `docs/superpowers/specs/2026-09-17-content-cms-design.md`

## Global Constraints

- Use only Facebook Share and X Intent URLs.
- Every external share link uses `target="_blank" rel="noopener noreferrer"`.
- Support both public article aliases while they exist.

---

### Task 1: Render native share links

**Files:**
- Modify: `storefront/src/app/[locale]/news/[slug]/page.tsx`
- Modify: `storefront/src/app/[locale]/tin-tuc/[slug]/page.tsx`

**Interfaces:**
- Consumes `article.title` and the already-built canonical article URL.
- Produces accessible anchors for Facebook and X.

- [ ] **Step 1: Define encoded outbound URLs next to the existing `articleUrl` calculation**

```ts
const shareUrl = encodeURIComponent(articleUrl);
const shareTitle = encodeURIComponent(article.title);
const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
const xHref = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
```

- [ ] **Step 2: Render the two anchors after article tags/metadata**

Each anchor gets an explicit Vietnamese `aria-label`, its existing Lucide icon or text label, `target="_blank"`, and `rel="noopener noreferrer"`. Do not make a component because this is one small repeated block in the two legacy routes.

- [ ] **Step 3: Verify output and type-check**

Run: `npm run check-types` in `storefront/`. Open one locale route and inspect both hrefs, target, and rel attributes.

- [ ] **Step 4: Commit**

```bash
git add storefront/src/app/'[locale]'/news/'[slug]'/page.tsx storefront/src/app/'[locale]'/tin-tuc/'[slug]'/page.tsx
git commit -m "feat: add article share links"
```
