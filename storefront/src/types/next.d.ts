/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Global type definitions for Next.js App Router
 * These types handle the async params/searchParams in Next.js 15+
 */

/**
 * Page component props with async params and searchParams
 * @template Path - The route path pattern (e.g., '/[locale]/product/[slug]')
 * 
 * Note: Route params are always strings, not arrays.
 * Search params can be string | string[] | undefined (for query parameters).
 */
type PageProps<_Path extends string = string> = {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Layout component props with async params
 * @template Path - The route path pattern (e.g., '/[locale]')
 */
type LayoutProps<_Path extends string = string> = {
  children: React.ReactNode;
  params: Promise<Record<string, string>>;
};
