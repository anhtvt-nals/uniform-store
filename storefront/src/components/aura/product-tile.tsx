"use client";

import {useTranslations} from 'next-intl';
import {type MouseEvent, useState} from 'react';
import {Link} from '@/i18n/navigation';
import {FragmentOf, readFragment} from '@/graphql';
import {ProductCardFragment} from '@/lib/vendure/fragments';
import {Price} from '@/components/commerce/price';
import {Eye} from 'lucide-react';
import {ProductQuickView} from './product-quick-view';

export function ProductTile({product: productProp, index, compact = false, quickView = true}: {product: FragmentOf<typeof ProductCardFragment>; index: number; compact?: boolean; quickView?: boolean}) {
    const t = useTranslations('Product');
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [previewSide, setPreviewSide] = useState<'left' | 'right'>('right');
    const product = readFragment(ProductCardFragment, productProp);
    const imageUrl = product.productAsset?.preview;
    const price = product.priceWithTax;
    let priceNode: React.ReactNode = null;
    if (price.__typename === 'PriceRange') {
        if (price.min !== price.max) {
            priceNode = (
                <>
                    <span className="text-xs font-normal text-muted-foreground mr-1">{t('from')}</span>
                    <Price value={price.min} currencyCode={product.currencyCode} />
                </>
            );
        } else {
            priceNode = <Price value={price.min} currencyCode={product.currencyCode} />;
        }
    } else if (price.__typename === 'SinglePrice') {
        priceNode = <Price value={price.value} currencyCode={product.currencyCode} />;
    }

    const positionPreview = (event: MouseEvent<HTMLAnchorElement>) => {
        if (!compact) return;
        const {left, right, width} = event.currentTarget.getBoundingClientRect();
        setPreviewSide(right + width + 16 <= window.innerWidth || left < width + 16 ? 'right' : 'left');
    };

    return (
        <>
            <Link
                href={`/product/${product.slug}`}
                className={`group relative flex flex-col border border-border bg-background shadow-sm transition-shadow hover:shadow-md ${compact ? 'h-auto self-start rounded-2xl p-2' : 'h-full rounded-[24px] p-3'}`}
                onMouseEnter={positionPreview}
            >
                <div className="absolute top-5 left-5 z-20">
                    {index === 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">{t('bestSeller')}</span>}
                    {index === 1 && <span className="bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">{t('new')}</span>}
                </div>

                <div className={`relative overflow-hidden bg-muted ${compact ? 'mb-3 aspect-[16/15] rounded-xl' : 'mb-4 aspect-[4/5] flex-1 rounded-[16px]'}`}>
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                            {t('noImage')}
                        </div>
                    )}

                    <div
                        className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]"
                        onClick={(e) => {
                            if (!quickView) return;
                            // Prevent card link navigation; open quick view instead
                            e.preventDefault();
                            e.stopPropagation();
                            setQuickViewOpen(true);
                        }}
                    >
                        <button
                            type="button"
                            onClick={(e) => {
                                if (!quickView) return;
                                e.preventDefault();
                                e.stopPropagation();
                                setQuickViewOpen(true);
                            }}
                            className="bg-background text-foreground px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-lg cursor-pointer"
                        >
                            <Eye className="w-4 h-4" /> {t('viewDetail')}
                        </button>
                    </div>
                </div>

                {compact && imageUrl && (
                    <div aria-hidden="true" className={`pointer-events-none absolute top-1/2 z-40 hidden w-full -translate-y-1/2 scale-95 rounded-2xl border border-border bg-background p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 lg:block ${previewSide === 'right' ? 'left-[calc(100%+1rem)]' : 'right-[calc(100%+1rem)]'}`}>
                        <img src={imageUrl} alt="" className="aspect-[4/5] w-full rounded-xl object-cover" />
                    </div>
                )}

                <div className="px-1 flex flex-col gap-1.5">
                    <h4 className="font-bold text-sm text-foreground truncate">{product.productName}</h4>
                    <div className="flex justify-between items-end">
                        <div className="text-xs font-bold text-primary">{priceNode}</div>
                        <div className="text-[10px] font-medium text-muted-foreground">{t('sold', {count: 100 + index * 25})}</div>
                    </div>
                </div>
            </Link>

            {quickView && quickViewOpen && (
                <ProductQuickView slug={product.slug} onClose={() => setQuickViewOpen(false)} />
            )}
        </>
    );
}
