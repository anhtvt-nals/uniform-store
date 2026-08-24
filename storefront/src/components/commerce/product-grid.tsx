import {ResultOf} from '@/graphql';
import {PackageSearch} from 'lucide-react';
import {ProductTile} from '@/components/aura/product-tile';
import {Pagination} from '@/components/shared/pagination';
import {SortDropdown} from './sort-dropdown';
import {SearchProductsQuery} from "@/lib/vendure/queries";
import {getRouteLocale} from '@/i18n/server';
import {getTranslations} from 'next-intl/server';

interface ProductGridProps {
    productDataPromise: Promise<{
        data: ResultOf<typeof SearchProductsQuery>;
        token?: string;
    }>;
    currentPage: number;
    take: number;
}

export async function ProductGrid({productDataPromise, currentPage, take}: ProductGridProps) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Product'});
    const result = await productDataPromise;

    const searchResult = result.data.search;
    const totalPages = Math.ceil(searchResult.totalItems / take);

    if (!searchResult.items.length) {
        return (
            <div className="flex min-h-[340px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
                <div className="mb-5 flex size-24 items-center justify-center rounded-3xl border border-primary/15 bg-primary/5 text-primary shadow-sm">
                    <PackageSearch aria-hidden="true" className="size-11" strokeWidth={1.5} />
                </div>
                <p className="text-base font-semibold text-foreground">{t('noProductsFound')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {t('productCount', {count: searchResult.totalItems})}
                </p>
                <SortDropdown/>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                {searchResult.items.map((product, i) => (
                    <ProductTile key={'product-grid-item' + i} product={product} index={i} compact />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages}/>
            )}
        </div>
    );
}
