"use client";

import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {Link} from '@/i18n/navigation';
import {FragmentOf, readFragment} from '@/graphql';
import {ProductCardFragment} from '@/lib/vendure/fragments';
import {Price} from '@/components/commerce/price';
import {Eye} from 'lucide-react';
import {ProductQuickView} from './product-quick-view';

export function ProductTile({product: productProp, index}: {product: FragmentOf<typeof ProductCardFragment>; index: number}) {
    const t = useTranslations('Product');
    const [quickViewOpen, setQuickViewOpen] = useState(false);
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

    return (
        <>
            <Link
                href={`/product/${product.slug}`}
                className="group flex flex-col bg-background border border-border rounded-[24px] p-3 shadow-sm hover:shadow-md transition-shadow relative"
            >
                <div className="absolute top-5 left-5 z-20">
                    {index === 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">{t('bestSeller')}</span>}
                    {index === 1 && <span className="bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">{t('new')}</span>}
                </div>

                <div className="relative rounded-[16px] bg-muted overflow-hidden flex-1 aspect-[4/5] mb-4">
                    {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
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
                            // Prevent card link navigation; open quick view instead
                            e.preventDefault();
                            e.stopPropagation();
                            setQuickViewOpen(true);
                        }}
                    >
                        <button
                            type="button"
                            onClick={(e) => {
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

                <div className="px-1 flex flex-col gap-1.5">
                    <h4 className="font-bold text-sm text-foreground truncate">{product.productName}</h4>
                    <div className="flex justify-between items-end">
                        <div className="text-xs font-bold text-primary">{priceNode}</div>
                        <div className="text-[10px] font-medium text-muted-foreground">{t('sold', {count: 100 + index * 25})}</div>
                    </div>
                </div>
            </Link>

            {quickViewOpen && (
                <ProductQuickView slug={product.slug} onClose={() => setQuickViewOpen(false)} />
            )}
        </>
    );
}
