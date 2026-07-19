'use client';

import {useState} from 'react';
import {Link} from '@/i18n/navigation';
import {FragmentOf} from '@/graphql';
import {ProductCardFragment} from '@/lib/vendure/fragments';
import {ProductTile} from './product-tile';
import {ArrowRight} from 'lucide-react';

export function FeaturedCategoryTabsClient({
    categories,
    productsMap,
    title,
    viewAllLabel,
    noProductsLabel,
    tileLabels,
}: {
    categories: Array<{id: string; name: string; slug: string}>;
    productsMap: Record<string, Array<FragmentOf<typeof ProductCardFragment>>>;
    title: string;
    viewAllLabel: string;
    noProductsLabel: string;
    tileLabels: { viewAllProducts: string };
}) {
    const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? '');
    const products = activeSlug ? (productsMap[activeSlug] || []) : [];

    return (
        <div className="flex flex-col gap-6">
            {/* Title + category tabs at same level (one row) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 border-b border-border pb-4">
                <h2 className="text-3xl font-black tracking-tighter text-foreground">{title}</h2>
                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground overflow-x-auto pb-2 md:pb-0">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveSlug(cat.slug)}
                            className={`px-6 py-2.5 rounded-full transition font-bold uppercase tracking-widest text-[10px] whitespace-nowrap inline-flex items-center gap-1 ${
                                activeSlug === cat.slug
                                    ? 'bg-foreground text-background'
                                    : 'bg-muted/50 text-foreground hover:bg-muted'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product grid for active tab: 4 products + "view more" item */}
            {products.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <p>{noProductsLabel}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {products.map((product, i) => (
                        <ProductTile key={i} product={product} index={i} />
                    ))}

                    <Link
                        href={`/collection/${activeSlug}`}
                        className="group flex flex-col bg-background border-2 border-dashed border-border rounded-[24px] p-3 shadow-sm hover:bg-muted transition-colors cursor-pointer justify-center items-center h-full min-h-[320px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-4">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                        <div className="font-black text-xl text-foreground">{tileLabels.viewAllProducts}</div>
                    </Link>
                </div>
            )}

            <div className="flex justify-center">
                <Link
                    href={`/collection/${activeSlug}`}
                    className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors"
                >
                    {viewAllLabel}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>
        </div>
    );
}
