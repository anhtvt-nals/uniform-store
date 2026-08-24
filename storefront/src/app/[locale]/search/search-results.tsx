import {Suspense} from "react";
import {getRouteLocale} from "@/i18n/server";
import {getActiveCurrencyCode} from '@/lib/currency-server';
import {CategorySidebar} from "@/components/commerce/category-sidebar";
import {ProductGridSkeleton} from "@/components/shared/product-grid-skeleton";
import {ProductGrid} from "@/components/commerce/product-grid";
import {buildSearchInput, getCurrentPage, PRODUCT_LIST_PAGE_SIZE} from "@/lib/search-helpers";
import {query} from "@/lib/vendure/api";
import {GetTopCollectionsQuery, SearchProductsQuery} from "@/lib/vendure/queries";

interface SearchResultsProps {
    searchParams: Promise<{
        page?: string;
        collection?: string;
    }>
}

export async function SearchResults({searchParams}: SearchResultsProps) {
    const searchParamsResolved = await searchParams;
    const locale = await getRouteLocale();
    const currencyCode = await getActiveCurrencyCode();
    const page = getCurrentPage(searchParamsResolved);

    const productDataPromise = query(SearchProductsQuery, {
        input: buildSearchInput({
            searchParams: searchParamsResolved,
            collectionSlug: searchParamsResolved.collection,
        })
    }, {languageCode: locale, currencyCode});

    const categoriesPromise = query(GetTopCollectionsQuery, undefined, {
        languageCode: locale,
    });
    const categoriesResult = await categoriesPromise;
    const categories = categoriesResult.data.collections?.items ?? [];

    return (
        <div className="space-y-5 md:space-y-8">
            <CategorySidebar categories={categories} currentSlug={searchParamsResolved.collection}/>

            <div className="w-full">
                <Suspense fallback={<ProductGridSkeleton/>}>
                    <ProductGrid productDataPromise={productDataPromise} currentPage={page} take={PRODUCT_LIST_PAGE_SIZE}/>
                </Suspense>
            </div>
        </div>
    )
}
