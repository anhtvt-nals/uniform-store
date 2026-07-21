import {Suspense} from 'react';
import {Link} from '@/i18n/navigation';
import {getTranslations} from 'next-intl/server';
import {query} from '@/lib/vendure/api';
import {SearchProductsQuery} from '@/lib/vendure/queries';
import {getRouteLocale} from '@/i18n/server';
import {getActiveCurrencyCode} from '@/lib/currency-server';
import {ProductTile} from './product-tile';
import {ArrowRight} from 'lucide-react';

async function getProducts(locale: string, currencyCode: string, limit: number) {

    const result = await query(
        SearchProductsQuery,
        {
            input: {
                take: limit,
                skip: 0,
                groupByProduct: true,
                sort: { name: 'ASC' as const },
            },
        },
        {languageCode: locale, currencyCode},
    );

    return result.data.search.items;
}

export async function ProductsSection({limit = 9}: {limit?: number}) {
    const locale = await getRouteLocale();
    const currencyCode = await getActiveCurrencyCode();
    const t = await getTranslations({locale, namespace: 'Product'});

    return (
        <div className="md:col-span-12 flex flex-col gap-6 mt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 border-b border-border pb-4">
                <h2 className="text-3xl font-black tracking-tighter text-foreground">{t('featuredProducts')}</h2>
                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground overflow-x-auto pb-2 md:pb-0">
                    <Link
                        href="/search"
                        className="px-6 py-2.5 ml-2 hover:bg-muted bg-muted/50 rounded-full transition text-foreground font-bold uppercase tracking-widest text-[10px] whitespace-nowrap inline-flex items-center gap-1"
                    >
                        {t('viewAllProducts')} →
                    </Link>
                </div>
            </div>

            <Suspense fallback={<ProductsSkeleton count={limit} />}>
                <ProductsGrid limit={limit} locale={locale} currencyCode={currencyCode} />
            </Suspense>
        </div>
    );
}

async function ProductsGrid({limit, locale, currencyCode}: {limit: number; locale: string; currencyCode: string}) {
    const items = await getProducts(locale, currencyCode, limit);
    const products = items.slice(0, limit);
    const t = await getTranslations({locale, namespace: 'Product'});

    if (products.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <p>{t('noProductsFound')}</p>
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${limit === 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-6`}>
            {products.map((product, i) => (
                <ProductTile key={i} product={product} index={i} />
            ))}

            <Link
                href="/search"
                className="group flex flex-col bg-background border-2 border-dashed border-border rounded-[24px] p-3 shadow-sm hover:bg-muted transition-colors cursor-pointer justify-center items-center h-full min-h-[320px]"
            >
                <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-4">
                    <ArrowRight className="w-6 h-6" />
                </div>
                <div className="font-black text-xl text-foreground">{t('viewAllProducts')}</div>
            </Link>
        </div>
    );
}

function ProductsSkeleton({count}: {count: number}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
