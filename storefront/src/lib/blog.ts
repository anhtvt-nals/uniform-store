import {
    getArticleBySlug,
    getArticles,
    formatArticleDate,
    getArticleImageUrl,
    type ArticleCard,
    type ArticleDetail,
} from '@/lib/actions/articles';

/**
 * Backwards-compatible blog data access.
 *
 * The previous Blog entity has been superseded by the full Article / News
 * module. These functions delegate to the new Article server actions so
 * that existing `tin-tuc` pages keep working while the new `news` pages
 * use the Article API directly.
 */
export type BlogCard = ArticleCard;
export type BlogDetail = ArticleDetail;

/**
 * Get all published articles (newest first), cached for 1 hour.
 * @deprecated Use `getArticles` from `@/lib/actions/articles` directly.
 */
export async function getAllBlogs(locale: string): Promise<BlogCard[]> {
    const { items } = await getArticles({ take: 100 }, locale);
    return items;
}

/**
 * Get a single published article by slug, cached for 1 hour.
 * @deprecated Use `getArticleBySlug` from `@/lib/actions/articles` directly.
 */
export async function getBlogBySlug(slug: string, locale: string): Promise<BlogDetail | undefined> {
    const article = await getArticleBySlug(slug, locale);
    return article ?? undefined;
}

/**
 * Format an ISO date string for display.
 * @deprecated Use `formatArticleDate` from `@/lib/actions/articles` directly.
 */
export function formatBlogDate(dateString: string | null, locale: string): string {
    return formatArticleDate(dateString, locale);
}

/**
 * Re-export the image URL helper for backwards compatibility.
 */
export { getArticleImageUrl };
