import {Suspense} from 'react';
import {getTranslations} from 'next-intl/server';
import {query} from '@/lib/vendure/api';
import {SearchProductsQuery} from '@/lib/vendure/queries';
import {getTopCollections} from '@/lib/vendure/cached';
import {getRouteLocale} from '@/i18n/server';
import {getActiveCurrencyCode} from '@/lib/currency-server';
import {FeaturedCategoryTabsClient} from './featured-category-tabs-client';
import {FragmentOf} from '@/graphql';
import {ProductCardFragment} from '@/lib/vendure/fragments';

type CollectionItem = {
    id: string;
    name: string;
    slug: string;
    featuredAsset?: { id: string; preview: string } | null;
};

async function getCollectionProducts(locale: string, currencyCode: string, collectionSlug: string, take: number) {

    const result = await query(
        SearchProductsQuery,
        {
            input: {
                take,
                skip: 0,
                groupByProduct: true,
                collectionSlug,
                sort: { name: 'ASC' as const },
            },
        },
        {languageCode: locale, currencyCode},
    );

    return result.data.search.items;
}

export async function FeaturedCategoryTabs() {
    const locale = await getRouteLocale();
    const currencyCode = await getActiveCurrencyCode();
    const t = await getTranslations({locale, namespace: 'Product'});

    const collections = (await getTopCollections(locale)) as CollectionItem[];
    const top5 = collections.slice(0, 5);

    if (top5.length === 0) {
        return null;
    }

    return (
        <div className="md:col-span-12 flex flex-col gap-6 mt-4">
            <Suspense fallback={<FullSkeleton />}>
                <FeaturedCategoryTabsInner
                    categories={top5}
                    locale={locale}
                    currencyCode={currencyCode}
                    title={t('featuredProducts')}
                    viewAllLabel={t('viewAllProducts')}
                    noProductsLabel={t('noProductsFound')}
                />
            </Suspense>
        </div>
    );
}

async function FeaturedCategoryTabsInner({
    categories,
    locale,
    currencyCode,
    title,
    viewAllLabel,
    noProductsLabel,
}: {
    categories: CollectionItem[];
    locale: string;
    currencyCode: string;
    title: string;
    viewAllLabel: string;
    noProductsLabel: string;
}) {
    // Pre-load products for all categories (4 each)
    const allProducts = await Promise.all(
        categories.map(async (cat) => {
            const items = await getCollectionProducts(locale, currencyCode, cat.slug, 4);
            return { slug: cat.slug, products: items.slice(0, 4) };
        }),
    );

    const productsMap: Record<string, Array<FragmentOf<typeof ProductCardFragment>>> = {};
    for (const entry of allProducts) {
        productsMap[entry.slug] = entry.products;
    }

    return (
        <FeaturedCategoryTabsClient
            categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
            productsMap={productsMap}
            title={title}
            viewAllLabel={viewAllLabel}
            noProductsLabel={noProductsLabel}
            tileLabels={{ viewAllProducts: viewAllLabel }}
        />
    );
}

function ProductsSkeleton({count}: {count: number}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({length: count}).map((_, i) => (
                <div key={i} className="bg-background border border-border rounded-[24px] p-3 shadow-sm animate-pulse">
                    <div className="rounded-[16px] bg-muted aspect-[4/5] mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                </div>
            ))}
        </div>
    );
}

function FullSkeleton() {
    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 border-b border-border pb-4">
                <div className="h-9 w-64 bg-muted rounded animate-pulse" />
                <div className="flex gap-2">
                    {Array.from({length: 5}).map((_, i) => (
                        <div key={i} className="h-9 w-24 bg-muted rounded-full animate-pulse" />
                    ))}
                </div>
            </div>
            <ProductsSkeleton count={4} />
        </div>
    );
}
