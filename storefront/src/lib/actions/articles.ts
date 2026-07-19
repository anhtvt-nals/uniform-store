import { query } from '@/lib/vendure/api';
import { readFragment } from '@/graphql';

import {
    ArticleCardFragment,
    ArticleDetailFragment,
    GetArticleBySlugDocument,
    GetArticlesDocument,
    GetArticleCategoriesDocument,
} from '@/lib/graphql/articles';

/**
 * A published article shown in list / card views.
 */
export type ArticleCard = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    author: string | null;
    publishedAt: string | null;
    viewCount: number;
    featuredAsset: {
        id: string;
        preview: string;
        source: string;
        width: number;
        height: number;
        name: string;
    } | null;
    category: { id: string; name: string; slug: string } | null;
    tags: Array<{ id: string; name: string; slug: string }>;
};

/**
 * A full published article for the detail page.
 */
export type ArticleDetail = ArticleCard & {
    content: string | null;
    createdAt: string;
    updatedAt: string;
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string | null;
    assets: Array<{
        id: string;
        preview: string;
        source: string;
        width: number;
        height: number;
        name: string;
    }>;
};

export interface ArticleListResult {
    items: ArticleCard[];
    totalItems: number;
}

export interface ArticleListParams {
    skip?: number;
    take?: number;
    search?: string;
    category?: string;
    tag?: string;
}

/**
 * Fetch a paginated list of published articles.
 *
 * Results are cached for 1 hour and tagged per-locale so they can be
 * revalidated on demand.
 */
export async function getArticles(
    params: ArticleListParams = {},
    languageCode?: string,
): Promise<ArticleListResult> {
    const result = await query(GetArticlesDocument, {
        skip: params.skip ?? 0,
        take: params.take ?? 12,
        search: params.search ?? null,
        category: params.category ?? null,
        tag: params.tag ?? null,
    }, { languageCode });

    const items = (result.data.articles?.items ?? []).map(
        item => readFragment(ArticleCardFragment, item) as unknown as ArticleCard,
    );
    return {
        items,
        totalItems: result.data.articles?.totalItems ?? 0,
    };
}

/**
 * Fetch a single published article by slug.
 *
 * Returns `null` when no published article matches (the storefront should
 * render a 404 in that case). Cached for 1 hour, tagged per slug.
 */
export async function getArticleBySlug(
    slug: string,
    languageCode?: string,
): Promise<ArticleDetail | null> {
    const result = await query(GetArticleBySlugDocument, { slug }, { languageCode });
    const article = result.data.article;
    if (!article) {
        return null;
    }
    return readFragment(ArticleDetailFragment, article) as unknown as ArticleDetail;
}

/**
 * Format an ISO date string for display in the storefront.
 */
export function formatArticleDate(dateString: string | null, locale: string): string {
    if (!dateString) return '';
    try {
        return new Intl.DateTimeFormat(
            locale === 'vi' ? 'vi-VN' : locale === 'de' ? 'de-DE' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' },
        ).format(new Date(dateString));
    } catch {
        return dateString;
    }
}

/**
 * Build the public URL for an article's featured asset, falling back to
 * the Vendure-relative preview path. The Vendure asset server serves
 * assets at the configured `assetUrlPrefix`.
 */
export function getArticleImageUrl(article: { featuredAsset?: { source: string; preview: string } | null }): string | null {
    if (!article.featuredAsset) return null;
    return article.featuredAsset.preview || article.featuredAsset.source || null;
}

/**
 * Estimate reading time based on HTML content word count.
 * Average reading speed: ~200 words/min.
 */
export function calculateReadingTime(html: string | null): number {
    if (!html) return 0;
    const text = html.replace(/<[^>]+>/g, '');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

/**
 * Estimate reading time from plain text (e.g. excerpt).
 * Falls back to 1 min for short text.
 */
export function estimateReadingTime(text: string | null | undefined): number {
    if (!text) return 1;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

export interface ArticleCategoryItem {
    id: string;
    name: string;
    slug: string;
}

/**
 * Fetch all published article categories.
 * Returns an empty array on failure so the UI degrades gracefully.
 */
export async function getArticleCategories(languageCode?: string): Promise<ArticleCategoryItem[]> {
    try {
        const result = await query(GetArticleCategoriesDocument, {}, { languageCode });
        const data = result.data as { articleCategories?: { items: ArticleCategoryItem[] } } | null;
        return data?.articleCategories?.items ?? [];
    } catch {
        return [];
    }
}
