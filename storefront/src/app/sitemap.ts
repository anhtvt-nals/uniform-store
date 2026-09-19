import type { MetadataRoute } from "next";
import { readFragment } from "@/graphql";
import { routing } from "@/i18n/routing";
import { getArticles } from "@/lib/actions/articles";
import { SITE_URL, buildCanonicalUrl } from "@/lib/metadata";
import { query } from "@/lib/vendure/api";
import { GetSitemapProductsQuery } from "@/lib/vendure/queries";
import { ProductCardFragment } from "@/lib/vendure/fragments";

const publicPaths = ["", "/news", "/dich-vu", "/ve-chung-toi"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await Promise.all(
    routing.locales.map(async (locale) => {
      const [articles, products] = await Promise.all([
        getArticles({ take: 1000 }, locale).catch(() => ({ items: [] })),
        query(
          GetSitemapProductsQuery,
          { input: { take: 0, groupByProduct: true } },
          { languageCode: locale },
        ).catch(() => ({ data: { search: { items: [] } } })),
      ]);

      const staticEntries = publicPaths.map((path) => ({
        url: buildCanonicalUrl(`/${locale}${path}`),
      }));
      const articleEntries = articles.items.map((article) => ({
        url: buildCanonicalUrl(`/${locale}/news/${article.slug}`),
        lastModified: article.publishedAt || undefined,
      }));
      const productEntries = (products.data.search?.items ?? []).map((product) => {
        const card = readFragment(ProductCardFragment, product);
        return { url: buildCanonicalUrl(`/${locale}/product/${card.slug}`) };
      });

      return [...staticEntries, ...articleEntries, ...productEntries];
    }),
  );

  return Array.from(new Map(entries.flat().map((entry) => [entry.url, entry])).values());
}
