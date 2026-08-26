'use server';

import {query} from '@/lib/vendure/api';
import {GetProductDetailQuery} from '@/lib/vendure/queries';
import {getDisplayOptionGroups} from '@/lib/vendure/product-options';
import {getActiveCurrencyCode} from '@/lib/currency-server';
import {getLocale} from 'next-intl/server';
import type {ResultOf} from 'gql.tada';

type ProductDetail = NonNullable<ResultOf<typeof GetProductDetailQuery>['product']>;

export async function getProductForQuickView(slug: string) {
    // Server Actions run outside the cached RSC tree, so use getLocale()
    // from next-intl/server instead of getRouteLocale() (root params).
    const locale = await getLocale();
    const currencyCode = await getActiveCurrencyCode();
    const result = await query(GetProductDetailQuery, {slug}, {languageCode: locale, currencyCode});
    const product = result.data.product as ProductDetail | null | undefined;
    if (!product) return null;
    const shopApiUrl = process.env.VENDURE_SHOP_API_URL || process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL;
    const sizeData = shopApiUrl
        ? await fetch(new URL(`/api/v1/products/${slug}`, shopApiUrl), {next: {revalidate: 60}}).then((response) => response.ok ? response.json() : null).catch(() => null)
        : null;
    return {
        ...product,
        sizes: sizeData?.sizes || [],
        sizeGuideImageUrl: sizeData?.sizeGuideImageUrl || "",
        optionGroups: getDisplayOptionGroups(product),
    };
}
