import type { Metadata } from 'next';

export type BreadcrumbItem = { name: string; url: string };

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildArticleJsonLd(input: {
  title: string;
  description?: string | null;
  url: string;
  publishedAt?: string | null;
  imageUrl?: string | null;
  author?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description || undefined,
    url: input.url,
    datePublished: input.publishedAt || undefined,
    image: input.imageUrl || undefined,
    author: { '@type': 'Organization', name: input.author || SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: item.url,
    })),
  };
}

export function buildOrganizationJsonLd() {
  return { '@context': 'https://schema.org', '@type': 'Organization', name: SITE_NAME, url: SITE_URL };
}

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Minh An Uniform';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://minhanuniform.com';

/**
 * Truncate text to a maximum length, preserving word boundaries.
 * Strips HTML tags and is ideal for meta descriptions (recommended 150-160 chars).
 */
export function truncateDescription(
  text: string | null | undefined,
  maxLength = 155
): string {
  if (!text) return '';

  // Strip HTML tags if present
  const cleanText = text.replace(/<[^>]*>/g, '').trim();

  if (cleanText.length <= maxLength) return cleanText;

  // Find the last space before maxLength to avoid cutting words
  const truncated = cleanText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  return lastSpaceIndex > 0
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...';
}

/**
 * Build a canonical URL for a given path.
 */
export function buildCanonicalUrl(path: string): string {
  const baseUrl = SITE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Build Open Graph image array from an image URL.
 */
export function buildOgImages(
  imageUrl: string | null | undefined,
  alt?: string
): NonNullable<Metadata['openGraph']>['images'] {
  if (!imageUrl) return undefined;

  return [
    {
      url: imageUrl,
      alt: alt || 'Product image',
    },
  ];
}

/**
 * Create noindex/nofollow robots config for protected pages.
 */
export function noIndexRobots(): Metadata['robots'] {
  return {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  };
}
