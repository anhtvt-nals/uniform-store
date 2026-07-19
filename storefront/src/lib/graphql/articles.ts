import { graphql } from '@/graphql';

/**
 * GraphQL fragments and queries for the Article / News system.
 *
 * These are used by the storefront server components and server actions
 * to fetch published articles from the Vendure Shop API.
 */

// ---------------------------------------------------------------------------
// Fragments
// ---------------------------------------------------------------------------

/**
 * Minimal article fields for list / card views.
 */
export const ArticleCardFragment = graphql(`
    fragment ArticleCard on Article {
        id
        title
        slug
        excerpt
        author
        publishedAt
        viewCount
        featuredAsset {
            id
            preview
            source
            width
            height
            name
        }
        category {
            id
            name
            slug
        }
        tags {
            id
            name
            slug
        }
    }
`);

/**
 * Full article fields including rich content and SEO metadata for the
 * detail page and generateMetadata.
 */
export const ArticleDetailFragment = graphql(`
    fragment ArticleDetail on Article {
        id
        title
        slug
        excerpt
        content
        author
        publishedAt
        viewCount
        createdAt
        updatedAt
        seoTitle
        seoDescription
        seoKeywords
        featuredAsset {
            id
            preview
            source
            width
            height
            name
        }
        assets {
            id
            preview
            source
            width
            height
            name
        }
        category {
            id
            name
            slug
        }
        tags {
            id
            name
            slug
        }
    }
`);

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Paginated list of published articles with optional search and
 * category / tag filtering.
 */
export const GetArticlesDocument = graphql(`
    query GetArticles($skip: Int, $take: Int, $search: String, $category: String, $tag: String) {
        articles(skip: $skip, take: $take, search: $search, category: $category, tag: $tag) {
            items {
                ...ArticleCard
            }
            totalItems
        }
    }
`, [ArticleCardFragment]);

/**
 * Fetch a single published article by slug.
 */
export const GetArticleBySlugDocument = graphql(`
    query GetArticleBySlug($slug: String!) {
        article(slug: $slug) {
            ...ArticleDetail
        }
    }
`, [ArticleDetailFragment]);

/**
 * Fetch all article categories (for navigation / filtering UI).
 */
export const GetArticleCategoriesDocument = graphql(`
    query GetArticleCategories {
        articleCategories {
            items {
                id
                name
                slug
            }
            totalItems
        }
    }
`);

/**
 * Fetch all article tags (for navigation / filtering UI).
 */
export const GetArticleTagsDocument = graphql(`
    query GetArticleTags {
        articleTags {
            items {
                id
                name
                slug
            }
            totalItems
        }
    }
`);
