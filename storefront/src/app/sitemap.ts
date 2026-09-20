import type { MetadataRoute } from "next";
import { readFragment } from "@/graphql";
import { routing } from "@/i18n/routing";
import { getArticles } from "@/lib/actions/articles";
import { buildCanonicalUrl } from "@/lib/metadata";
import { query } from "@/lib/vendure/api";
import { GetTopCollectionsQuery, SearchProductsQuery } from "@/lib/vendure/queries";
import { ProductCardFragment } from "@/lib/vendure/fragments";

const publicPaths = ["", "/news", "/dich-vu", "/ve-chung-toi"];
const PAGE_SIZE = 100;

async function getAllArticles(locale: string) {
  const items = [];
  for (let skip = 0; ; skip += PAGE_SIZE) {
    const page = await getArticles({ skip, take: PAGE_SIZE }, locale).catch(() => ({ items: [], totalItems: 0 }));
    items.push(...page.items);
    if (items.length >= page.totalItems || page.items.length < PAGE_SIZE) return items;
  }
}

async function getAllProducts(locale: string) {
  const items = [];
  for (let skip = 0; ; skip += PAGE_SIZE) {
    const page = await query(SearchProductsQuery, { input: { skip, take: PAGE_SIZE, groupByProduct: true } }, { languageCode: locale })
      .catch(() => ({ data: { search: { items: [], totalItems: 0 } } }));
    items.push(...page.data.search.items);
    if (items.length >= page.data.search.totalItems || page.data.search.items.length < PAGE_SIZE) return items;
  }
}

type SitemapCollection = { slug: string; children?: SitemapCollection[] };

function flattenCollections(collections: SitemapCollection[]): SitemapCollection[] {
  return collections.flatMap((collection) => [collection, ...flattenCollections((collection.children ?? []) as typeof collections)]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await Promise.all(routing.locales.map(async (locale) => {
    const [articles, products, collectionResult] = await Promise.all([
      getAllArticles(locale),
      getAllProducts(locale),
      query(GetTopCollectionsQuery, {}, { languageCode: locale }).catch(() => ({ data: { collections: { items: [] } } })),
    ]);
    const collections = flattenCollections(collectionResult.data.collections.items as SitemapCollection[]);
    return [
      ...publicPaths.map((path) => ({ url: buildCanonicalUrl(path) })),
      ...collections.map((collection) => ({ url: buildCanonicalUrl(`/collection/${collection.slug}`) })),
      ...articles.map((article) => ({ url: buildCanonicalUrl(`/news/${article.slug}`), lastModified: article.publishedAt || undefined })),
      ...products.map((product) => ({ url: buildCanonicalUrl(`/product/${readFragment(ProductCardFragment, product).slug}`) })),
    ];
  }));
  return Array.from(new Map(entries.flat().map((entry) => [entry.url, entry])).values());
}
